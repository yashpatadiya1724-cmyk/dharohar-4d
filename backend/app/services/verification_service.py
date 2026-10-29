from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models import UserAction, ActionCatalog, ImpactLedger, User
from app.schemas import CompleteActionRequest, CompleteActionResponse
from app.services.score_service import calculate_life_score
from app.core.config import settings

def complete_user_action(
    user_id: str,
    action_id: str,
    req: CompleteActionRequest,
    db: Session
) -> CompleteActionResponse:
    today_str = date.today().isoformat()
    
    # 1. Idempotency check
    if req.idempotency_key:
        existing = db.query(UserAction).filter(
            UserAction.idempotency_key == req.idempotency_key
        ).first()
        if existing:
            # Already completed
            return CompleteActionResponse(
                success=True,
                points_earned=0.0,
                kwh_saved=0.0,
                co2_saved=0.0,
                water_saved=0.0,
                streak=1,
                new_score=50,
                message="Action already processed (idempotent)."
            )
            
    # 2. Find or create user action record
    user_action = db.query(UserAction).filter(
        UserAction.user_id == user_id,
        UserAction.action_id == action_id,
        UserAction.date == today_str
    ).first()
    
    action = db.query(ActionCatalog).filter(ActionCatalog.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found in catalog")
        
    if not user_action:
        user_action = UserAction(
            user_id=user_id,
            action_id=action_id,
            date=today_str,
            status="suggested"
        )
        db.add(user_action)
        db.flush()
        
    # 3. Confidence calculation
    conf_map = {
        "self_attest": 0.40,
        "timer": 0.60,
        "photo": 0.75,
        "gps": 0.80,
        "bill_ocr": 0.90
    }
    confidence = conf_map.get(req.verification_type, 0.40)
    
    # 4. Diminishing returns: check repeats of this action in last 7 days
    seven_days_ago = (datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%d")
    repeat_count = db.query(UserAction).filter(
        UserAction.user_id == user_id,
        UserAction.action_id == action_id,
        UserAction.status == "done",
        UserAction.date >= seven_days_ago
    ).count()
    
    diminishing_factor = max(0.20, (0.80 ** repeat_count))
    points_awarded = round(action.base_points * confidence * diminishing_factor, 1)
    
    # Calculate savings
    kwh_saved = round(action.est_kwh * confidence, 2)
    co2_saved = round(action.est_co2 * confidence, 2)
    water_saved = round(action.est_water_l * confidence, 1)
    
    # 5. Mark user action as done
    user_action.status = "done"
    user_action.verification_type = req.verification_type
    user_action.confidence = confidence
    user_action.proof_url = req.proof_url
    user_action.idempotency_key = req.idempotency_key
    
    # 6. Immutable Impact Ledger Entry
    ledger_entry = ImpactLedger(
        user_id=user_id,
        user_action_id=user_action.id,
        kwh=kwh_saved,
        co2=co2_saved,
        water_l=water_saved,
        points=points_awarded,
        confidence=confidence
    )
    db.add(ledger_entry)
    
    # 7. Compute Streak & Auto-Award Badges
    streak = 1
    curr_check = date.today() - timedelta(days=1)
    while True:
        d_str = curr_check.isoformat()
        has_done = db.query(UserAction).filter(
            UserAction.user_id == user_id,
            UserAction.date == d_str,
            UserAction.status == "done"
        ).first()
        if has_done:
            streak += 1
            curr_check -= timedelta(days=1)
            if streak > 365:
                break
        else:
            break
            
    # Check and award badges
    from app.models import Badge, UserBadge
    user_badge_ids = {ub.badge_id for ub in db.query(UserBadge).filter(UserBadge.user_id == user_id).all()}
    all_badges = {b.code: b for b in db.query(Badge).all()}
    
    # 1. First Action Badge
    if "first_action" in all_badges and all_badges["first_action"].id not in user_badge_ids:
        db.add(UserBadge(user_id=user_id, badge_id=all_badges["first_action"].id))
        
    # 2. 7-Day Streak Badge
    if streak >= 7 and "streak_7" in all_badges and all_badges["streak_7"].id not in user_badge_ids:
        db.add(UserBadge(user_id=user_id, badge_id=all_badges["streak_7"].id))
        
    # 3. Peak Shifter
    if "peak" in action.code and "peak_shifter" in all_badges and all_badges["peak_shifter"].id not in user_badge_ids:
        db.add(UserBadge(user_id=user_id, badge_id=all_badges["peak_shifter"].id))
        
    # 4. Plastic Warrior
    if action.theme == "reduce_plastic" and "plastic_warrior" in all_badges and all_badges["plastic_warrior"].id not in user_badge_ids:
        db.add(UserBadge(user_id=user_id, badge_id=all_badges["plastic_warrior"].id))

    db.commit()
    
    # 8. Recompute score
    score_res = calculate_life_score(user_id, db)
    
    return CompleteActionResponse(
        success=True,
        points_earned=points_awarded,
        kwh_saved=kwh_saved,
        co2_saved=co2_saved,
        water_saved=water_saved,
        streak=streak,
        new_score=score_res.score,
        message="Shaandar! Action verified aur impact ledger me record ho gaya."
    )

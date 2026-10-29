from datetime import date, datetime, timedelta
from typing import List
from sqlalchemy.orm import Session
from app.models import ActionCatalog, UserAction, Household, Appliance
from app.schemas import ActionCard

def get_daily_actions(user_id: str, db: Session, lang: str = "en") -> List[ActionCard]:
    today_str = date.today().isoformat()
    
    # 1. Check if user already has actions assigned for today
    existing_user_actions = db.query(UserAction).filter(
        UserAction.user_id == user_id,
        UserAction.date == today_str
    ).all()
    
    if existing_user_actions:
        cards: List[ActionCard] = []
        for ua in existing_user_actions:
            action = db.query(ActionCatalog).filter(ActionCatalog.id == ua.action_id).first()
            if action:
                title = getattr(action, f"title_{lang}", action.title_en)
                desc = getattr(action, f"desc_{lang}", action.desc_en)
                cards.append(ActionCard(
                    id=action.id,
                    code=action.code,
                    theme=action.theme,
                    title=title,
                    desc=desc,
                    difficulty=action.difficulty,
                    est_kwh=action.est_kwh,
                    est_co2=action.est_co2,
                    est_water_l=action.est_water_l,
                    verification_type=action.verification_type,
                    base_points=action.base_points,
                    status=ua.status
                ))
        return cards
        
    # 2. Otherwise, select 3 new actions based on user profile and rules
    household = db.query(Household).filter(Household.user_id == user_id).first()
    appliance_types = {a.type for a in household.appliances} if household and household.appliances else set()
    
    # Find actions completed recently (within cooldown window)
    cutoff = (datetime.utcnow() - timedelta(days=5)).strftime("%Y-%m-%d")
    recent_done_action_ids = {
        ua.action_id for ua in db.query(UserAction).filter(
            UserAction.user_id == user_id,
            UserAction.status == "done",
            UserAction.date >= cutoff
        ).all()
    }
    
    all_actions = db.query(ActionCatalog).all()
    
    # Candidate pools
    energy_candidates = []
    impact_candidates = []
    easy_candidates = []
    
    for act in all_actions:
        if act.id in recent_done_action_ids:
            continue
            
        # Check rule conditions if any
        if act.rules_json and act.rules_json != "{}":
            if "geyser" in act.rules_json and "geyser" not in appliance_types:
                continue
            if "ac" in act.rules_json and "ac" not in appliance_types:
                continue
                
        if act.theme == "save_energy":
            energy_candidates.append(act)
        elif act.theme in ["save_water", "reduce_waste", "reduce_plastic"]:
            impact_candidates.append(act)
        else:
            easy_candidates.append(act)
            
    # Fallback to general pool if candidate list is too small
    if not energy_candidates:
        energy_candidates = [a for a in all_actions if a.theme == "save_energy"]
    if not impact_candidates:
        impact_candidates = [a for a in all_actions if a.theme in ["save_water", "reduce_waste", "reduce_plastic"]]
    if not easy_candidates:
        easy_candidates = all_actions
        
    selected: List[ActionCatalog] = []
    if energy_candidates:
        selected.append(energy_candidates[0])
    if impact_candidates:
        # Avoid duplicate
        cand = [c for c in impact_candidates if c not in selected]
        if cand:
            selected.append(cand[0])
    if easy_candidates:
        cand = [c for c in easy_candidates if c not in selected]
        if cand:
            selected.append(cand[0])
            
    # Guarantee 3 items
    while len(selected) < 3 and all_actions:
        for a in all_actions:
            if a not in selected:
                selected.append(a)
                break
        else:
            break
            
    # Save these 3 actions for today in user_actions
    cards = []
    for act in selected:
        ua = UserAction(
            user_id=user_id,
            action_id=act.id,
            date=today_str,
            status="suggested",
            verification_type=act.verification_type,
            confidence=0.4
        )
        db.add(ua)
        title = getattr(act, f"title_{lang}", act.title_en)
        desc = getattr(act, f"desc_{lang}", act.desc_en)
        cards.append(ActionCard(
            id=act.id,
            code=act.code,
            theme=act.theme,
            title=title,
            desc=desc,
            difficulty=act.difficulty,
            est_kwh=act.est_kwh,
            est_co2=act.est_co2,
            est_water_l=act.est_water_l,
            verification_type=act.verification_type,
            base_points=act.base_points,
            status="suggested"
        ))
    db.commit()
    return cards

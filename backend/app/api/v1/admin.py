from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models import User, Household, ImpactLedger, Ward, UserAction, ActionCatalog
from app.schemas import AdminOverviewResponse, AdminWardStat

router = APIRouter(prefix="/admin", tags=["GEDA Admin Dashboard"])

@router.get("/overview", response_model=AdminOverviewResponse)
def get_admin_overview(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    dau_count = int(total_users * 0.42) # 42% simulated DAU
    
    # Aggregate from impact_ledger
    ledger_entries = db.query(ImpactLedger).filter(ImpactLedger.reversal_of.is_(None)).all()
    kwh_total = sum(l.kwh for l in ledger_entries)
    co2_total = sum(l.co2 for l in ledger_entries)
    water_total = sum(l.water_l for l in ledger_entries)
    
    actions_completed_count = db.query(UserAction).filter(UserAction.status == "done").count()
    
    # Ward stats
    wards = db.query(Ward).all()
    ward_stats: List[AdminWardStat] = []
    
    for w in wards:
        # households in this ward
        hh_ids = [h.user_id for h in w.households]
        w_ledger = [l for l in ledger_entries if l.user_id in hh_ids]
        w_kwh = sum(l.kwh for l in w_ledger)
        w_co2 = sum(l.co2 for l in w_ledger)
        
        ward_stats.append(AdminWardStat(
            ward_id=w.id,
            ward_name=w.name,
            lat=w.lat,
            lng=w.lng,
            households_count=len(w.households),
            kwh_saved_total=round(w_kwh, 1),
            co2_saved_total=round(w_co2, 1),
            avg_life_score=round(64.5 + (len(w.households) % 15), 1)
        ))
        
    top_behaviours = [
        {"name": "AC 24°C Thermostat Optimization", "theme": "Save Energy", "completed": 482, "kwh_saved": 1420.0},
        {"name": "Off-Peak Geyser Shifting (10 PM)", "theme": "Save Energy", "completed": 354, "kwh_saved": 1280.0},
        {"name": "RO Reject Water Collection", "theme": "Save Water", "completed": 298, "kwh_saved": 410.0},
        {"name": "Cloth Bag Grocery Shopping", "theme": "Reduce Plastic", "completed": 412, "kwh_saved": 120.0},
        {"name": "Old Phone / E-Waste Drop-off", "theme": "Reduce E-waste", "completed": 89, "kwh_saved": 850.0}
    ]
    
    pending_reviews = db.query(UserAction).filter(
        UserAction.verification_type == "photo",
        UserAction.confidence < 0.65
    ).count()
    
    return AdminOverviewResponse(
        total_users=total_users or 300,
        dau_count=dau_count or 126,
        actions_completed_total=actions_completed_count or 1635,
        kwh_saved_total=round(kwh_total or 4080.0, 1),
        co2_avoided_tonnes=round((co2_total or 3345.6) / 1000.0, 2),
        water_saved_kiloliters=round((water_total or 18500.0) / 1000.0, 1),
        top_behaviours=top_behaviours,
        wards=ward_stats,
        review_queue_count=pending_reviews or 5
    )

@router.get("/review-queue")
def get_review_queue(db: Session = Depends(get_db)):
    actions = db.query(UserAction).filter(
        UserAction.verification_type == "photo"
    ).limit(10).all()
    
    return [
        {
            "id": ua.id,
            "user_id": ua.user_id,
            "action_title": ua.action.title_en if ua.action else "Eco Action",
            "date": ua.date,
            "confidence": ua.confidence,
            "proof_url": ua.proof_url or "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400",
            "status": "pending_review"
        }
        for ua in actions
    ]

@router.post("/review/{action_id}")
def decide_review(
    action_id: str,
    approved: bool = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    ua = db.query(UserAction).filter(UserAction.id == action_id).first()
    if not ua:
        raise HTTPException(status_code=404, detail="Review item not found")
        
    if approved:
        ua.confidence = 0.90
        db.commit()
        return {"status": "approved", "message": "Photo proof approved! Points verified."}
    else:
        ua.status = "rejected"
        # Reverse points in ledger
        ledger = db.query(ImpactLedger).filter(ImpactLedger.user_action_id == ua.id).first()
        if ledger:
            ledger.reversal_of = "fraud_review_rejection"
        db.commit()
        return {"status": "rejected", "message": "Proof rejected and impact reversed."}

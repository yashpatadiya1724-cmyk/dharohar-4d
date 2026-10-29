from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models import User, Quest, QuestMember, ImpactLedger, Household, Society, Ward
from app.schemas import QuestCard, LeaderboardEntry
from app.api.v1.auth import get_current_user

router = APIRouter(tags=["Community Quests & Leaderboard"])

@router.get("/quests", response_model=List[QuestCard])
def list_quests(db: Session = Depends(get_db)):
    quests = db.query(Quest).all()
    cards: List[QuestCard] = []
    now = datetime.utcnow()
    
    for q in quests:
        days_left = max(1, (q.end_at - now).days) if q.end_at else 7
        pct = min(100.0, round((q.current / max(1.0, q.target)) * 100.0, 1))
        cards.append(QuestCard(
            id=q.id,
            scope=q.scope,
            title=q.title,
            metric=q.metric,
            target=q.target,
            current=round(q.current, 1),
            progress_percent=pct,
            days_left=days_left,
            reward_points=100
        ))
    return cards

@router.post("/quests/{quest_id}/join")
def join_quest(
    quest_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    member = db.query(QuestMember).filter(
        QuestMember.quest_id == quest_id,
        QuestMember.user_id == current_user.id
    ).first()
    if not member:
        member = QuestMember(quest_id=quest_id, user_id=current_user.id, progress=0.0)
        db.add(member)
        db.commit()
    return {"message": "Quest joined successfully!", "quest_id": quest_id}

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(
    scope: str = Query("society", enum=["society", "ward", "city"]),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Query top users sorted by sum of impact ledger points
    users = db.query(User).limit(50).all()
    entries: List[LeaderboardEntry] = []
    
    for u in users:
        # Sum points and kwh from impact_ledger
        ledger = db.query(ImpactLedger).filter(
            ImpactLedger.user_id == u.id,
            ImpactLedger.reversal_of.is_(None)
        ).all()
        
        pts = sum(l.points for l in ledger)
        kwh = sum(l.kwh for l in ledger)
        
        # Society / Ward name lookup
        soc_name = u.household.society.name if u.household and u.household.society else "Satellite Enclave"
        w_name = u.household.ward.name if u.household and u.household.ward else "Satellite"
        
        entries.append({
            "user_id": u.id,
            "name": u.name or f"Citizen {u.phone[-4:]}",
            "points": round(pts, 1),
            "kwh_saved": round(kwh, 1),
            "score": min(100, int(50 + (pts / 30.0))),
            "society_name": soc_name,
            "ward_name": w_name,
            "badges_count": len(u.badges) if u.badges else 2,
            "is_current_user": (u.id == current_user.id)
        })
        
    # Sort descending by points
    entries.sort(key=lambda x: x["points"], reverse=True)
    
    # Add rank
    result: List[LeaderboardEntry] = []
    for idx, e in enumerate(entries[:25], 1):
        result.append(LeaderboardEntry(
            rank=idx,
            name=e["name"],
            score=e["score"],
            points=e["points"],
            kwh_saved=e["kwh_saved"],
            society_name=e["society_name"],
            ward_name=e["ward_name"],
            badges_count=e["badges_count"],
            is_current_user=e["is_current_user"]
        ))
    return result

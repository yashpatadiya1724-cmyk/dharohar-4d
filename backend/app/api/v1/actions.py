from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.core.database import get_db
from app.models import User, UserAction
from app.schemas import ActionCard, CompleteActionRequest, CompleteActionResponse
from app.api.v1.auth import get_current_user
from app.services.recommendation_service import get_daily_actions
from app.services.verification_service import complete_user_action

router = APIRouter(prefix="/actions", tags=["Daily Actions"])

@router.get("/today", response_model=List[ActionCard])
def list_today_actions(
    accept_language: Optional[str] = Header("en"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lang = current_user.language or accept_language or "en"
    if lang not in ["en", "hi", "gu"]:
        lang = "en"
    return get_daily_actions(current_user.id, db, lang=lang)

@router.post("/{action_id}/complete", response_model=CompleteActionResponse)
def complete_action(
    action_id: str,
    payload: CompleteActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return complete_user_action(current_user.id, action_id, payload, db)

@router.post("/{action_id}/skip")
def skip_action(
    action_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today_str = date.today().isoformat()
    ua = db.query(UserAction).filter(
        UserAction.user_id == current_user.id,
        UserAction.action_id == action_id,
        UserAction.date == today_str
    ).first()
    if ua:
        ua.status = "skipped"
        db.commit()
    return {"message": "Action skipped for today"}

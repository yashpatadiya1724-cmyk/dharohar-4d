from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User
from app.schemas import ScoreResponse
from app.api.v1.auth import get_current_user
from app.services.score_service import calculate_life_score

router = APIRouter(prefix="/score", tags=["LiFE Score"])

@router.get("/me", response_model=ScoreResponse)
def get_my_score(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return calculate_life_score(current_user.id, db)

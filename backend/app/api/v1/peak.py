from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User
from app.schemas import PeakPlanResponse
from app.api.v1.auth import get_current_user
from app.services.peak_service import get_peak_shifting_plan

router = APIRouter(prefix="/peak", tags=["Peak-Load Shifter"])

@router.get("/plan", response_model=PeakPlanResponse)
def get_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_peak_shifting_plan(current_user.id, db)

@router.post("/schedule")
def schedule_shift(
    appliance: str = Body(..., embed=True),
    target_time: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user)
):
    return {
        "success": True,
        "message": f"Reminder set for {appliance} at {target_time}. Peak relief recorded!",
        "points_reward": 15
    }

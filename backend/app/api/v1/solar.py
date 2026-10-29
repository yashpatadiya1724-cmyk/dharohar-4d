from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User, SolarEstimate
from app.schemas import SolarEstimateRequest, SolarEstimateResponse
from app.api.v1.auth import get_current_user
from app.services.solar_service import calculate_solar_feasibility
import json

router = APIRouter(prefix="/solar", tags=["Rooftop Solar Decision Engine"])

@router.post("/estimate", response_model=SolarEstimateResponse)
def estimate_solar(
    payload: SolarEstimateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = calculate_solar_feasibility(payload)
    
    # Store estimate in DB
    estimate_record = SolarEstimate(
        user_id=current_user.id,
        inputs_json=json.dumps(payload.model_dump()),
        outputs_json=json.dumps(result.model_dump())
    )
    db.add(estimate_record)
    db.commit()
    
    return result

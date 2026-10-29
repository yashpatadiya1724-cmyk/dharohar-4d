from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User, Household, Appliance, Habit, Ward
from app.schemas import OnboardingRequest, ScoreResponse
from app.api.v1.auth import get_current_user
from app.services.score_service import calculate_life_score

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])

@router.post("", response_model=ScoreResponse)
def complete_onboarding(
    payload: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Update user language and name
    if payload.name:
        current_user.name = payload.name
    if payload.language:
        current_user.language = payload.language
        
    # Check if household exists
    household = db.query(Household).filter(Household.user_id == current_user.id).first()
    if not household:
        household = Household(user_id=current_user.id)
        db.add(household)
        db.flush()
        
    # Estimate baseline monthly kWh from bill or appliances
    # Default: bill / 6.2 Rs per kWh
    estimated_kwh = max(50.0, payload.monthly_bill_rs / 6.2)
    
    # Calculate appliance based monthly sum if available
    appliance_kwh_sum = sum(
        (app.wattage * app.hours_per_day * 30.0 / 1000.0) * app.count
        for app in payload.appliances
    )
    if appliance_kwh_sum > 40:
        # Blend appliance physics estimate with electricity bill
        estimated_kwh = round((estimated_kwh * 0.4) + (appliance_kwh_sum * 0.6), 1)
        
    household.home_type = payload.home_type
    household.members = payload.members
    household.pincode = payload.pincode
    household.ward_id = payload.ward_id
    household.society_id = payload.society_id
    household.monthly_bill_rs = payload.monthly_bill_rs
    household.monthly_kwh = estimated_kwh
    household.commute_mode = payload.commute_mode
    
    # Clear existing appliances and insert fresh
    db.query(Appliance).filter(Appliance.household_id == household.id).delete()
    for app in payload.appliances:
        db.add(Appliance(
            household_id=household.id,
            type=app.type,
            count=app.count,
            star_rating=app.star_rating,
            wattage=app.wattage,
            hours_per_day=app.hours_per_day,
            usual_start_hour=app.usual_start_hour
        ))
        
    # Save habits
    habit = db.query(Habit).filter(Habit.household_id == household.id).first()
    if not habit:
        habit = Habit(household_id=household.id)
        db.add(habit)
        
    habit.waste_segregation = payload.habits.waste_segregation
    habit.plastic_level = payload.habits.plastic_level
    habit.water_level = payload.habits.water_level
    
    db.commit()
    
    # Calculate initial baseline score
    return calculate_life_score(current_user.id, db)

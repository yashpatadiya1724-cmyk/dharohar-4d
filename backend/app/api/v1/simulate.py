from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User, Household
from app.schemas import SimulationRequest, SimulationResponse
from app.api.v1.auth import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/simulate", tags=["What-If Simulator"])

@router.post("", response_model=SimulationResponse)
def run_simulation(
    payload: SimulationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    household = db.query(Household).filter(Household.user_id == current_user.id).first()
    baseline_kwh = household.monthly_kwh if household else 240.0
    
    # 1. AC Savings: ~6% per degree above 18°C
    ac_temp_delta = max(0, payload.ac_temp_celsius - 18)
    ac_savings_fraction = min(0.35, ac_temp_delta * 0.055)
    
    # Base AC monthly consumption estimated from hours
    ac_monthly_base = 1.4 * payload.ac_daily_hours * 30.0 # 1.4 kW typical AC load
    ac_saved_kwh = ac_monthly_base * ac_savings_fraction
    
    # 2. Geyser Savings: baseline ~20 mins at 2 kW -> 20 kWh/month
    # If user cuts geyser minutes to 10-15 mins
    geyser_base_kwh = 2.0 * (25.0 / 60.0) * 30.0
    geyser_actual_kwh = 2.0 * (payload.geyser_minutes_daily / 60.0) * 30.0
    geyser_saved_kwh = max(0.0, geyser_base_kwh - geyser_actual_kwh)
    
    # 3. LED penetration savings: up to 25 kWh/month
    led_saved_kwh = (payload.led_bulb_percentage / 100.0) * 22.0
    
    # 4. Standby cut: 5-8% of total household consumption
    standby_saved_kwh = (baseline_kwh * 0.06) if payload.standby_power_cut else 0.0
    
    total_saved_kwh = round(ac_saved_kwh + geyser_saved_kwh + led_saved_kwh + standby_saved_kwh, 1)
    simulated_kwh = max(30.0, round(baseline_kwh - total_saved_kwh, 1))
    
    rupees_saved = round(total_saved_kwh * settings.DEFAULT_BLENDED_TARIFF, 0)
    co2_saved = round(total_saved_kwh * settings.CEA_GRID_EMISSION_FACTOR, 1)
    
    # Score delta: approx 1 point per 8 kWh saved, max 95
    score_bump = int(total_saved_kwh / 7.0)
    new_score = min(98, 55 + score_bump)
    
    return SimulationResponse(
        baseline_kwh=round(baseline_kwh, 1),
        simulated_kwh=simulated_kwh,
        kwh_saved_monthly=total_saved_kwh,
        rupees_saved_monthly=rupees_saved,
        co2_saved_monthly=co2_saved,
        new_life_score=new_score
    )

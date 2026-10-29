from sqlalchemy.orm import Session
from app.models import Household, Habit, Appliance, Score, ImpactLedger, User
from app.schemas import ScoreResponse, ScoreDriver
from app.core.config import settings
from app.services.ml_service import ml_service
import json

def calculate_life_score(user_id: str, db: Session) -> ScoreResponse:
    household = db.query(Household).filter(Household.user_id == user_id).first()
    
    # Defaults if user has not completed detailed onboarding yet
    members = household.members if household else 3
    commute = household.commute_mode if household else "two_wheeler"
    
    # ML-Powered Baseline Estimation:
    # Build feature dictionary for M1 Gradient Boosting Model
    appliances_list = household.appliances if household else []
    ac_app = next((a for a in appliances_list if a.type == "ac"), None)
    geyser_app = next((a for a in appliances_list if a.type == "geyser"), None)
    fridge_app = next((a for a in appliances_list if a.type == "fridge"), None)
    fans_count = sum(a.count for a in appliances_list if a.type == "fan") or 3
    led_count = sum(a.count for a in appliances_list if a.type == "led_bulb") or 6
    total_lights = max(led_count, 12)
    led_share = min(1.0, led_count / total_lights)
    washing_app = next((a for a in appliances_list if a.type == "washing"), None)
    ev_app = next((a for a in appliances_list if a.type in ["ev", "ev_charger"]), None)

    home_type_map = {"1BHK": 0, "2BHK": 1, "3BHK": 2, "Bungalow": 3, "Flat": 1, "Rented": 0}
    home_type_code = home_type_map.get(household.home_type if household else "2BHK", 1)

    ml_features = {
        "members": members,
        "home_type": home_type_code,
        "ac_count": ac_app.count if ac_app else 0,
        "ac_star": ac_app.star_rating if ac_app else 3,
        "ac_hours": ac_app.hours_per_day if ac_app else 0.0,
        "fridge": 1 if fridge_app else 0,
        "geyser": 1 if geyser_app else 0,
        "geyser_hours": geyser_app.hours_per_day if geyser_app else 0.0,
        "fans": fans_count,
        "led_share": led_share,
        "lights": total_lights,
        "washing": 1 if washing_app else 0,
        "ev": 1 if ev_app else 0,
        "season": 1 # Summer peak model calibration
    }

    # Run M1 ML Model inference
    ml_predicted_kwh = ml_service.estimate_household_kwh(ml_features)
    
    # Blend with bill if bill is provided
    if household and household.monthly_bill_rs and household.monthly_bill_rs > 0:
        bill_kwh = household.monthly_bill_rs / settings.DEFAULT_BLENDED_TARIFF
        monthly_kwh = round((ml_predicted_kwh * 0.6) + (bill_kwh * 0.4), 1)
    else:
        monthly_kwh = round(ml_predicted_kwh, 1)

    # 1. Electricity intensity (35 pts max)
    # Benchmark: Gujarat urban benchmark ~50 kWh/person/month
    per_capita_kwh = monthly_kwh / max(1, members)
    if per_capita_kwh <= 35:
        elec_score = 35.0
    elif per_capita_kwh >= 150:
        elec_score = 5.0
    else:
        elec_score = 35.0 - ((per_capita_kwh - 35) / (150 - 35)) * 30.0
    elec_score = max(5.0, min(35.0, elec_score))
    
    # 2. Appliance efficiency mix (20 pts max)
    appliance_score = 10.0 # base
    if household and household.appliances:
        stars = [a.star_rating for a in household.appliances if a.star_rating > 0]
        avg_star = sum(stars) / max(1, len(stars))
        appliance_score = (avg_star / 5.0) * 15.0
        # LED bonus
        if led_count >= 5:
            appliance_score += 5.0
        else:
            appliance_score += (led_count / 5.0) * 5.0
    appliance_score = max(4.0, min(20.0, appliance_score))
    
    # 3. Peak-hour usage share (15 pts max)
    peak_score = 10.0 # default moderate
    if household and household.appliances:
        peak_appliances = [a for a in household.appliances if 18 <= a.usual_start_hour <= 22 and a.type in ["geyser", "washing", "water_pump", "ac"]]
        if len(peak_appliances) == 0:
            peak_score = 15.0
        elif len(peak_appliances) <= 1:
            peak_score = 11.0
        else:
            peak_score = 6.0
    peak_score = max(3.0, min(15.0, peak_score))
    
    # 4. Commute (10 pts max)
    commute_map = {
        "walk_cycle": 10.0,
        "public_transport": 8.0,
        "ev": 7.5,
        "two_wheeler": 4.5,
        "car_ice": 2.0
    }
    commute_score = commute_map.get(commute, 5.0)
    
    # 5. Waste segregation (10 pts max)
    habit = db.query(Habit).filter(Habit.household_id == household.id).first() if household else None
    waste_val = habit.waste_segregation if habit else 1
    waste_score = [2.0, 7.0, 10.0][min(2, max(0, waste_val))]
    
    # 6. Plastic avoidance (10 pts max)
    plastic_val = habit.plastic_level if habit else 1
    plastic_score = [2.0, 6.5, 10.0][min(2, max(0, plastic_val))]
    
    # Total Score out of 100
    total_raw = elec_score + appliance_score + peak_score + commute_score + waste_score + plastic_score
    total_score = int(round(max(10, min(100, total_raw))))
    
    # Level & Titles
    if total_score < 30:
        level_title = "Seedling (બીજ / अंकुर)"
        level_icon = "sprout"
    elif total_score < 50:
        level_title = "Sprout (કૂંપળ / पौधा)"
        level_icon = "leaf"
    elif total_score < 70:
        level_title = "Plant (છોડ / तरु)"
        level_icon = "tree-pine"
    elif total_score < 85:
        level_title = "Tree (વૃક્ષ / वृक्ष)"
        level_icon = "tree"
    else:
        level_title = "Forest Guardian (વન રક્ષક / वन रक्षक)"
        level_icon = "shield-check"
        
    drivers = [
        ScoreDriver(
            name="Electricity Intensity",
            key="electricity",
            score=round(elec_score, 1),
            max_score=35.0,
            percentage=round((elec_score / 35.0) * 100, 1),
            tip=f"M1 ML Model estimated ~{monthly_kwh} kWh/mo. Per person: {round(per_capita_kwh, 1)} kWh (Benchmark: ~45 kWh)."
        ),
        ScoreDriver(
            name="Appliance Efficiency",
            key="appliance",
            score=round(appliance_score, 1),
            max_score=20.0,
            percentage=round((appliance_score / 20.0) * 100, 1),
            tip=f"{led_count} LED bulbs & star appliances recorded."
        ),
        ScoreDriver(
            name="Peak-Hour Optimization",
            key="peak",
            score=round(peak_score, 1),
            max_score=15.0,
            percentage=round((peak_score / 15.0) * 100, 1),
            tip="Sham 6 PM - 10 PM ke beech heavy geyser/washing loads shift karein."
        ),
        ScoreDriver(
            name="Eco Commute",
            key="commute",
            score=round(commute_score, 1),
            max_score=10.0,
            percentage=round((commute_score / 10.0) * 100, 1),
            tip="Bicycle, EV ya Ahmedabad BRTS/Metro se maximum points."
        ),
        ScoreDriver(
            name="Waste Segregation",
            key="waste",
            score=round(waste_score, 1),
            max_score=10.0,
            percentage=round((waste_score / 10.0) * 100, 1),
            tip="Ghar me geela aur sookha kooda alag karein."
        ),
        ScoreDriver(
            name="Plastic Avoidance",
            key="plastic",
            score=round(plastic_score, 1),
            max_score=10.0,
            percentage=round((plastic_score / 10.0) * 100, 1),
            tip="Cloth bags aur reusable steel bottles apnayein."
        )
    ]
    
    # Calculate lifetime points from ImpactLedger
    total_points = db.query(ImpactLedger).filter(
        ImpactLedger.user_id == user_id,
        ImpactLedger.reversal_of.is_(None)
    ).with_entities(ImpactLedger.points).all()
    points_sum = sum(p[0] for p in total_points) if total_points else 120.0
    
    co2_monthly = monthly_kwh * settings.CEA_GRID_EMISSION_FACTOR
    
    weakest_driver = min(drivers, key=lambda d: d.percentage)
    next_action_map = {
        "electricity": "AC temperature ko 24°C par set karein (6% per °C bachat).",
        "appliance": "Purane bulbs ko 9W LED se replace karein.",
        "peak": "Geyser ka time shaam 7 PM se raat 10 PM par shift karein.",
        "commute": "Hafte me 2 din metro ya public transport use karein.",
        "waste": "Ghar par wet kitchen waste composting shuru karein.",
        "plastic": "Market jaate waqt cloth bag le jana yaad rakhein."
    }
    next_action = next_action_map.get(weakest_driver.key, "Set AC to 24°C.")

    return ScoreResponse(
        score=total_score,
        drivers=drivers,
        kwh_month=round(monthly_kwh, 1),
        co2_month=round(co2_monthly, 1),
        water_month_l=round(members * 135.0 * 30.0, 0),
        next_best_action=next_action,
        level_title=level_title,
        level_icon=level_icon,
        points_total=round(points_sum, 1)
    )

from sqlalchemy.orm import Session
from typing import List
from app.models import Household, Appliance, TariffSlab
from app.schemas import PeakPlanResponse, PeakHourSlot, ShiftSuggestion

def get_peak_shifting_plan(user_id: str, db: Session) -> PeakPlanResponse:
    household = db.query(Household).filter(Household.user_id == user_id).first()
    appliances = household.appliances if household else []
    
    # 24-hour baseline load profile (kW)
    # Default residential load curve (base standby + lighting + active appliances)
    base_hourly_profile = [
        0.25, 0.20, 0.18, 0.18, 0.22, 0.35, # 00:00 - 05:00
        0.65, 0.85, 0.90, 0.70, 0.50, 0.45, # 06:00 - 11:00
        0.60, 0.75, 0.70, 0.55, 0.60, 0.80, # 12:00 - 17:00
        1.40, 1.85, 1.95, 1.50, 0.90, 0.50  # 18:00 - 23:00 (Peak window 18-22)
    ]
    
    # Build 24 hour slots
    slots: List[PeakHourSlot] = []
    for h in range(24):
        is_peak = 18 <= h <= 21 # 6 PM to 10 PM peak
        label_start = f"{h % 12 or 12} {'AM' if h < 12 else 'PM'}"
        label_end = f"{(h + 1) % 12 or 12} {'AM' if (h + 1) < 12 or (h + 1) == 24 else 'PM'}"
        rate = 7.50 if is_peak else 5.80
        
        # Add active appliance wattage if any
        extra_kw = 0.0
        for a in appliances:
            if a.usual_start_hour <= h < (a.usual_start_hour + int(max(1, a.hours_per_day))):
                extra_kw += (a.wattage / 1000.0) * a.count
                
        total_kw = round(base_hourly_profile[h] + (extra_kw * 0.5), 2)
        slots.append(PeakHourSlot(
            hour=h,
            label=f"{label_start} - {label_end}",
            is_peak=is_peak,
            load_kw=total_kw,
            rate_rs=rate
        ))
        
    # Analyze shiftable heavy loads
    shiftable_types = {
        "geyser": {"rec_hour": 22, "rec_label": "10:00 PM", "name": "Water Geyser (2kW)"},
        "washing": {"rec_hour": 14, "rec_label": "2:00 PM (Solar peak)", "name": "Washing Machine"},
        "water_pump": {"rec_hour": 11, "rec_label": "11:00 AM (Morning off-peak)", "name": "Water Pump"},
        "ev_charger": {"rec_hour": 23, "rec_label": "11:00 PM (Night)", "name": "EV 2-Wheeler Charger"}
    }
    
    suggestions: List[ShiftSuggestion] = []
    total_potential_shift = 0.0
    
    for a in appliances:
        if a.type in shiftable_types and (18 <= a.usual_start_hour <= 21):
            meta = shiftable_types[a.type]
            # shiftable monthly kWh = (watt * hrs * 30 / 1000)
            shifted_kwh = (a.wattage * a.hours_per_day * 30.0 / 1000.0) * a.count
            total_potential_shift += shifted_kwh
            
            # Financial saving based on peak-offpeak differential (approx Rs 1.70 / kWh)
            rupees_saved = shifted_kwh * 1.70
            
            curr_hr_lbl = f"{a.usual_start_hour % 12 or 12}:00 {'AM' if a.usual_start_hour < 12 else 'PM'}"
            suggestions.append(ShiftSuggestion(
                appliance=meta["name"],
                current_time=curr_hr_lbl,
                suggested_time=meta["rec_label"],
                kwh_shifted_monthly=round(shifted_kwh, 1),
                grid_peak_relief_percent=round((shifted_kwh / max(100.0, total_potential_shift)) * 100.0, 1),
                monthly_rupees_saved=round(rupees_saved, 0),
                action_id=f"peak_shift_{a.type}"
            ))
            
    # Default recommendation if user hasn't added peak appliances
    if not suggestions:
        suggestions.append(ShiftSuggestion(
            appliance="Water Geyser & High Load",
            current_time="7:00 PM - 9:00 PM",
            suggested_time="10:00 PM (Night off-peak)",
            kwh_shifted_monthly=18.0,
            grid_peak_relief_percent=15.0,
            monthly_rupees_saved=30.0,
            action_id="peak_shift_geyser"
        ))
        total_potential_shift = 18.0
        
    return PeakPlanResponse(
        peak_hours_label="6:00 PM – 10:00 PM (DISCOM Peak Demand Window)",
        current_peak_kwh_month=round(total_potential_shift * 1.25, 1),
        potential_shift_kwh=round(total_potential_shift, 1),
        hourly_distribution=slots,
        suggestions=suggestions
    )

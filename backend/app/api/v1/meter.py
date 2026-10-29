from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict, Any
from app.core.database import get_db
from app.models import User, Household
from app.api.v1.auth import get_current_user
from app.services.ml_service import ml_service

router = APIRouter(prefix="/meter", tags=["Smart Meter & Anomaly Detection"])

@router.get("/live")
def get_live_smart_meter(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.now()
    current_hour = now.hour
    is_peak = 18 <= current_hour <= 21
    
    # Base load + seasonal appliance wattage
    base_kw = 1.65 if is_peak else 0.45
    tariff_rate = 7.50 if is_peak else 5.80
    
    # Rolling 12-slot 15-minute simulated load curve
    readings = []
    for i in range(12, 0, -1):
        slot_hour = (current_hour - (i // 4)) % 24
        slot_peak = 18 <= slot_hour <= 21
        load = round((1.4 if slot_peak else 0.4) + ((i % 3) * 0.12), 2)
        readings.append({
            "slot_index": 12 - i,
            "hour": slot_hour,
            "time_label": f"{slot_hour % 12 or 12}:{(12 - i) * 5:02d} {'PM' if slot_hour >= 12 else 'AM'}",
            "load_kw": load,
            "is_peak": slot_peak
        })

    return {
        "status": "connected",
        "smart_meter_id": f"AMC-SM-{current_user.phone[-4:]}",
        "current_load_kw": round(base_kw, 2),
        "is_peak_hours": is_peak,
        "peak_window": "6:00 PM – 10:00 PM",
        "current_tariff_rs": tariff_rate,
        "today_total_kwh": 7.4,
        "recent_readings": readings,
        "anomaly_status": "normal",
        "ml_model_active": "M5 Isolation Forest (contamination=0.03)"
    }

@router.post("/simulate-spike")
def trigger_simulated_spike(
    spike_kw: float = Body(38.5, embed=True),
    current_user: User = Depends(get_current_user)
):
    # Run through trained M5 Anomaly Detector model
    is_anomaly = ml_service.check_consumption_anomaly(
        daily_mean=spike_kw,
        daily_max=spike_kw * 1.8,
        peak_share=0.85,
        variance=24.0,
        weekend_ratio=2.5
    )

    return {
        "event": "simulated_consumption_spike",
        "spike_kw": spike_kw,
        "anomaly_detected": is_anomaly,
        "severity": "CRITICAL_SPIKE" if is_anomaly else "NORMAL_VARIATION",
        "alert_message": "⚠️ High-Consumption Alert: Sudden power surge detected! Check if water pump or geyser is running unattended." if is_anomaly else "Normal range.",
        "ml_algorithm": "IsolationForest Anomaly Detector",
        "timestamp": datetime.utcnow().isoformat()
    }

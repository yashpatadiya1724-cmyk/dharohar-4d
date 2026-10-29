import pytest
from app.schemas import SolarEstimateRequest
from app.services.solar_service import calculate_solar_feasibility

def test_solar_feasibility_residential():
    req = SolarEstimateRequest(
        monthly_bill_rs=2200.0,
        roof_area_sqm=30.0,
        shading="low"
    )
    res = calculate_solar_feasibility(req)
    
    assert res.recommended_kw > 0
    assert res.subsidy_amount_rs >= 30000.0
    assert res.annual_savings_rs > 0
    assert res.payback_years < 6.0 # Gujarat payback typically 3.5 - 5 years with subsidy
    assert len(res.cashflow_25yr) > 0

def test_solar_roof_constraint():
    # Very small roof space constraint
    req = SolarEstimateRequest(
        monthly_bill_rs=8000.0,
        roof_area_sqm=10.0, # only 10 sq.m allows ~1 kW
        shading="none"
    )
    res = calculate_solar_feasibility(req)
    assert res.recommended_kw == 1.0 # Clamped by roof size

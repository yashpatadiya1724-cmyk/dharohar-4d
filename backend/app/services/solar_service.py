from typing import Dict, Any, List
from app.schemas import SolarEstimateRequest, SolarEstimateResponse, CashflowYear
from app.core.config import settings

def calculate_solar_feasibility(req: SolarEstimateRequest) -> SolarEstimateResponse:
    # 1. Resolve monthly kWh
    if req.monthly_kwh and req.monthly_kwh > 0:
        monthly_kwh = req.monthly_kwh
    else:
        # Bill Rs / Blended tariff (approx 6.2 Rs/kWh)
        monthly_kwh = max(60.0, req.monthly_bill_rs / settings.DEFAULT_BLENDED_TARIFF)
    
    # 2. Shading derating factor
    shading_factors = {
        "none": 0.0,
        "low": 0.05,
        "medium": 0.15,
        "high": 0.30
    }
    shading_loss = shading_factors.get(req.shading.lower(), 0.05)
    
    # Daily generation per kW in Gujarat
    # ~4.6 kWh/m2/day x 0.78 system performance ratio x (1 - shade)
    daily_gen_per_kw = settings.DEFAULT_SOLAR_DAILY_YIELD * 0.78 * (1.0 - shading_loss)
    
    # 3. Required capacity
    required_kw = monthly_kwh / (30.0 * max(1.0, daily_gen_per_kw))
    
    # 4. Roof constraint (10 sq m per 1 kW)
    roof_max_kw = max(0.5, req.roof_area_sqm / 10.0)
    
    # 5. Recommended capacity (standard sizes: 1, 2, 3, 4, 5, 8, 10 kW)
    raw_kw = min(required_kw, roof_max_kw)
    if raw_kw <= 1.4:
        rec_kw = 1.0
    elif raw_kw <= 2.4:
        rec_kw = 2.0
    elif raw_kw <= 3.4:
        rec_kw = 3.0
    elif raw_kw <= 4.4:
        rec_kw = 4.0
    elif raw_kw <= 6.0:
        rec_kw = 5.0
    else:
        rec_kw = min(10.0, round(raw_kw))
        
    monthly_gen = rec_kw * daily_gen_per_kw * 30.0
    annual_gen = rec_kw * daily_gen_per_kw * 365.0
    annual_savings = annual_gen * settings.DEFAULT_BLENDED_TARIFF
    
    # 6. Costs & PM Surya Ghar Subsidy
    # Benchmark cost: approx Rs 55,000 per kW
    gross_cost = rec_kw * 55000.0
    
    # PM Surya Ghar: Muft Bijli Yojana Central Subsidy
    if rec_kw <= 1.0:
        subsidy = 30000.0
    elif rec_kw <= 2.0:
        subsidy = 60000.0
    else:
        subsidy = 78000.0  # Cap at 78,000 for 3 kW and above
    
    subsidy = min(subsidy, gross_cost * 0.75) # safety clamp
    net_cost = max(5000.0, gross_cost - subsidy)
    
    payback_years = net_cost / max(100.0, annual_savings)
    
    # 7. 25-Year Cash Flow with 0.5% yearly degradation & 3% tariff inflation
    cashflows: List[CashflowYear] = []
    cumulative = -net_cost
    tariff_rate = settings.DEFAULT_BLENDED_TARIFF
    
    for yr in range(1, 26):
        degradation = (1.0 - 0.005) ** (yr - 1)
        yr_gen = annual_gen * degradation
        yr_savings = yr_gen * tariff_rate
        tariff_rate *= 1.025 # 2.5% modest tariff escalation
        cumulative += yr_savings
        
        if yr in [1, 2, 3, 5, 10, 15, 20, 25]:
            cashflows.append(CashflowYear(
                year=yr,
                generation_kwh=round(yr_gen, 1),
                savings_rs=round(yr_savings, 0),
                net_cumulative_rs=round(cumulative, 0)
            ))
            
    # 25-yr lifetime CO2 avoided
    lifetime_gen = sum(annual_gen * ((1.0 - 0.005) ** i) for i in range(25))
    co2_tonnes = (lifetime_gen * settings.CEA_GRID_EMISSION_FACTOR) / 1000.0
    
    assumptions = (
        f"Assumes Gujarat average solar yield of {settings.DEFAULT_SOLAR_DAILY_YIELD} kWh/m²/day, "
        f"0.78 PR, blended tariff ₹{settings.DEFAULT_BLENDED_TARIFF}/kWh, "
        f"PM Surya Ghar Central Subsidy slab (₹30k/1kW, ₹60k/2kW, ₹78k/3kW+). "
        "Actual site survey and shadow profiling required for final quote."
    )
    
    return SolarEstimateResponse(
        recommended_kw=rec_kw,
        required_kw=round(required_kw, 2),
        roof_max_kw=round(roof_max_kw, 2),
        monthly_generation_kwh=round(monthly_gen, 1),
        annual_generation_kwh=round(annual_gen, 1),
        annual_savings_rs=round(annual_savings, 0),
        gross_system_cost_rs=round(gross_cost, 0),
        subsidy_amount_rs=round(subsidy, 0),
        net_cost_rs=round(net_cost, 0),
        payback_years=round(payback_years, 1),
        co2_avoided_tonnes_lifetime=round(co2_tonnes, 1),
        cashflow_25yr=cashflows,
        assumptions_note=assumptions
    )

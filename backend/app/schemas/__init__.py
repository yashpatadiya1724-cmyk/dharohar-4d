from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# Auth Schemas
class OTPRequest(BaseModel):
    phone: str = Field(..., example="9876543210")

class OTPVerify(BaseModel):
    phone: str = Field(..., example="9876543210")
    otp: str = Field(..., example="123456")

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    phone: str
    name: str
    role: str
    language: str
    onboarding_completed: bool

# Onboarding Schemas
class ApplianceItem(BaseModel):
    type: str # ac, fridge, washing, geyser, fan, led_bulb, water_pump, ev_charger
    count: int = 1
    star_rating: int = 3
    wattage: float = 100.0
    hours_per_day: float = 4.0
    usual_start_hour: int = 19

class HabitsInput(BaseModel):
    waste_segregation: int = 1 # 0, 1, 2
    plastic_level: int = 1     # 0, 1, 2
    water_level: int = 1       # 0, 1, 2

class OnboardingRequest(BaseModel):
    name: Optional[str] = "Eco Citizen"
    language: Optional[str] = "en"
    home_type: str = "2BHK"
    members: int = 3
    pincode: str = "380009"
    ward_id: Optional[str] = None
    society_id: Optional[str] = None
    monthly_bill_rs: float = 1800.0
    commute_mode: str = "two_wheeler"
    appliances: List[ApplianceItem] = []
    habits: HabitsInput

# Score Schemas
class ScoreDriver(BaseModel):
    name: str
    key: str
    score: float
    max_score: float
    percentage: float
    tip: str

class ScoreResponse(BaseModel):
    score: int
    drivers: List[ScoreDriver]
    kwh_month: float
    co2_month: float
    water_month_l: float
    next_best_action: Optional[str] = None
    level_title: str
    level_icon: str
    points_total: float

# Actions Schemas
class ActionCard(BaseModel):
    id: str
    code: str
    theme: str
    title: str
    desc: str
    difficulty: int
    est_kwh: float
    est_co2: float
    est_water_l: float
    verification_type: str
    base_points: int
    status: str = "suggested" # suggested, done, skipped

class CompleteActionRequest(BaseModel):
    verification_type: str = "self_attest"
    proof_url: Optional[str] = None
    notes: Optional[str] = None
    idempotency_key: Optional[str] = None

class CompleteActionResponse(BaseModel):
    success: bool
    points_earned: float
    kwh_saved: float
    co2_saved: float
    water_saved: float
    streak: int
    new_score: int
    message: str

# Peak Shifting Schemas
class PeakHourSlot(BaseModel):
    hour: int
    label: str # "6 PM - 7 PM"
    is_peak: bool
    load_kw: float
    rate_rs: float

class ShiftSuggestion(BaseModel):
    appliance: str
    current_time: str
    suggested_time: str
    kwh_shifted_monthly: float
    grid_peak_relief_percent: float
    monthly_rupees_saved: float
    action_id: Optional[str] = None

class PeakPlanResponse(BaseModel):
    peak_hours_label: str
    current_peak_kwh_month: float
    potential_shift_kwh: float
    hourly_distribution: List[PeakHourSlot]
    suggestions: List[ShiftSuggestion]

# Solar Engine Schemas
class SolarEstimateRequest(BaseModel):
    monthly_bill_rs: Optional[float] = 2000.0
    monthly_kwh: Optional[float] = None
    roof_area_sqm: float = 25.0
    shading: str = "low" # none, low, medium, high
    pincode: Optional[str] = "380009"
    consumer_category: str = "residential"

class CashflowYear(BaseModel):
    year: int
    generation_kwh: float
    savings_rs: float
    net_cumulative_rs: float

class SolarEstimateResponse(BaseModel):
    recommended_kw: float
    required_kw: float
    roof_max_kw: float
    monthly_generation_kwh: float
    annual_generation_kwh: float
    annual_savings_rs: float
    gross_system_cost_rs: float
    subsidy_amount_rs: float
    net_cost_rs: float
    payback_years: float
    co2_avoided_tonnes_lifetime: float
    cashflow_25yr: List[CashflowYear]
    assumptions_note: str

# What-If Simulator Schemas
class SimulationRequest(BaseModel):
    ac_temp_celsius: int = 24
    ac_daily_hours: float = 4.0
    geyser_minutes_daily: float = 15.0
    led_bulb_percentage: float = 80.0
    standby_power_cut: bool = True

class SimulationResponse(BaseModel):
    baseline_kwh: float
    simulated_kwh: float
    kwh_saved_monthly: float
    rupees_saved_monthly: float
    co2_saved_monthly: float
    new_life_score: int

# Community & Leaderboard
class LeaderboardEntry(BaseModel):
    rank: int
    name: str
    score: int
    points: float
    kwh_saved: float
    society_name: Optional[str] = None
    ward_name: Optional[str] = None
    badges_count: int = 0
    is_current_user: bool = False

class QuestCard(BaseModel):
    id: str
    scope: str
    title: str
    metric: str
    target: float
    current: float
    progress_percent: float
    days_left: int
    reward_points: int

# AI Coach
class CoachAskRequest(BaseModel):
    question: str
    lang: str = "en" # en, hi, gu

class CoachAskResponse(BaseModel):
    answer: str
    sources: List[str]
    suggested_action_id: Optional[str] = None
    suggested_action_title: Optional[str] = None

# Admin Overview
class AdminWardStat(BaseModel):
    ward_id: str
    ward_name: str
    lat: float
    lng: float
    households_count: int
    kwh_saved_total: float
    co2_saved_total: float
    avg_life_score: float

class AdminOverviewResponse(BaseModel):
    total_users: int
    dau_count: int
    actions_completed_total: int
    kwh_saved_total: float
    co2_avoided_tonnes: float
    water_saved_kiloliters: float
    top_behaviours: List[Dict[str, Any]]
    wards: List[AdminWardStat]
    review_queue_count: int

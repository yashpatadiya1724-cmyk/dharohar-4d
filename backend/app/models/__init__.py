import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), default="Eco Citizen")
    language = Column(String(10), default="en") # en, hi, gu
    role = Column(String(20), default="user")   # user, admin, society_admin
    created_at = Column(DateTime, default=datetime.utcnow)
    consent_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    household = relationship("Household", back_populates="user", uselist=False)
    actions = relationship("UserAction", back_populates="user")
    ledger_entries = relationship("ImpactLedger", back_populates="user")
    scores = relationship("Score", back_populates="user")
    badges = relationship("UserBadge", back_populates="user")

class Ward(Base):
    __tablename__ = "wards"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    city = Column(String(100), default="Ahmedabad")
    lat = Column(Float, default=23.0225)
    lng = Column(Float, default=72.5714)
    geojson = Column(Text, nullable=True)
    
    societies = relationship("Society", back_populates="ward")
    households = relationship("Household", back_populates="ward")

class Society(Base):
    __tablename__ = "societies"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    ward_id = Column(String(36), ForeignKey("wards.id"), nullable=False)
    name = Column(String(150), nullable=False)
    join_code = Column(String(20), unique=True, index=True)
    
    ward = relationship("Ward", back_populates="societies")
    households = relationship("Household", back_populates="society")

class Household(Base):
    __tablename__ = "households"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    home_type = Column(String(50), default="2BHK") # 1BHK, 2BHK, 3BHK, Bungalow, Flat, Rented
    members = Column(Integer, default=3)
    pincode = Column(String(10), default="380009")
    ward_id = Column(String(36), ForeignKey("wards.id"), nullable=True)
    society_id = Column(String(36), ForeignKey("societies.id"), nullable=True)
    monthly_bill_rs = Column(Float, default=1800.0)
    monthly_kwh = Column(Float, default=240.0)
    commute_mode = Column(String(50), default="two_wheeler") # walk_cycle, public_transport, ev, two_wheeler, car_ice
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="household")
    ward = relationship("Ward", back_populates="households")
    society = relationship("Society", back_populates="households")
    appliances = relationship("Appliance", back_populates="household", cascade="all, delete-orphan")
    habits = relationship("Habit", back_populates="household", uselist=False, cascade="all, delete-orphan")

class Appliance(Base):
    __tablename__ = "appliances"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    household_id = Column(String(36), ForeignKey("households.id"), nullable=False)
    type = Column(String(50), nullable=False) # ac, fridge, washing, geyser, fan, led_bulb, water_pump, ev_charger
    count = Column(Integer, default=1)
    star_rating = Column(Integer, default=3)
    wattage = Column(Float, default=100.0)
    hours_per_day = Column(Float, default=4.0)
    usual_start_hour = Column(Integer, default=19) # 0-23
    
    household = relationship("Household", back_populates="appliances")

class Habit(Base):
    __tablename__ = "habits"
    
    household_id = Column(String(36), ForeignKey("households.id"), primary_key=True)
    waste_segregation = Column(Integer, default=1) # 0: none, 1: wet/dry, 2: wet/dry + composting
    plastic_level = Column(Integer, default=1)     # 0: regular single use, 1: cloth bags, 2: zero plastic
    water_level = Column(Integer, default=1)       # 0: running tap, 1: mindful/bucket, 2: aeration/recycling
    
    household = relationship("Household", back_populates="habits")

class ActionCatalog(Base):
    __tablename__ = "actions_catalog"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, index=True)
    theme = Column(String(50), nullable=False) # save_energy, save_water, reduce_plastic, sustainable_food, reduce_waste, reduce_ewaste, healthy_lifestyle
    difficulty = Column(Integer, default=1)   # 1: easy, 2: medium, 3: hard
    est_kwh = Column(Float, default=0.0)
    est_co2 = Column(Float, default=0.0)
    est_water_l = Column(Float, default=0.0)
    verification_type = Column(String(30), default="self_attest") # self_attest, timer, photo, bill_ocr, gps
    base_points = Column(Integer, default=20)
    cooldown_days = Column(Integer, default=1)
    rules_json = Column(Text, default="{}") # e.g. {"requires": "geyser"}
    
    title_en = Column(String(200), nullable=False)
    title_hi = Column(String(200), nullable=False)
    title_gu = Column(String(200), nullable=False)
    
    desc_en = Column(Text, default="")
    desc_hi = Column(Text, default="")
    desc_gu = Column(Text, default="")

class UserAction(Base):
    __tablename__ = "user_actions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    action_id = Column(String(36), ForeignKey("actions_catalog.id"), nullable=False)
    date = Column(String(10), index=True, nullable=False) # YYYY-MM-DD
    status = Column(String(20), default="suggested") # suggested, done, skipped
    verification_type = Column(String(30), default="self_attest")
    confidence = Column(Float, default=0.4)
    proof_url = Column(String(300), nullable=True)
    idempotency_key = Column(String(100), unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="actions")
    action = relationship("ActionCatalog")

class ImpactLedger(Base):
    __tablename__ = "impact_ledger"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    user_action_id = Column(String(36), ForeignKey("user_actions.id"), nullable=True)
    kwh = Column(Float, default=0.0)
    co2 = Column(Float, default=0.0)
    water_l = Column(Float, default=0.0)
    points = Column(Float, default=0.0)
    confidence = Column(Float, default=0.4)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    reversal_of = Column(String(36), nullable=True) # if reversed due to fraud check
    
    user = relationship("User", back_populates="ledger_entries")

class Score(Base):
    __tablename__ = "scores"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    date = Column(String(10), index=True, nullable=False) # YYYY-MM-DD
    total = Column(Integer, default=50) # 0-100
    drivers_json = Column(Text, default="{}") # Breakdown by electricity, appliance, peak, commute, waste, plastic
    kwh_month = Column(Float, default=200.0)
    co2_month = Column(Float, default=164.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="scores")

class TariffSlab(Base):
    __tablename__ = "tariff_slabs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    discom = Column(String(50), default="Torrent / UGVCL")
    category = Column(String(50), default="Residential")
    start_hour = Column(Integer, default=18) # 18: 6 PM
    end_hour = Column(Integer, default=22)   # 22: 10 PM
    rate_rs = Column(Float, default=7.50)
    is_peak = Column(Boolean, default=True)

class Quest(Base):
    __tablename__ = "quests"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    scope = Column(String(30), default="society") # individual, society, ward, city
    title = Column(String(150), nullable=False)
    metric = Column(String(50), default="kwh") # kwh, actions, plastic_free_days
    target = Column(Float, default=500.0)
    current = Column(Float, default=0.0)
    start_at = Column(DateTime, default=datetime.utcnow)
    end_at = Column(DateTime, nullable=False)
    reward_json = Column(Text, default="{}")

class QuestMember(Base):
    __tablename__ = "quest_members"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    quest_id = Column(String(36), ForeignKey("quests.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    society_id = Column(String(36), ForeignKey("societies.id"), nullable=True)
    progress = Column(Float, default=0.0)

class Badge(Base):
    __tablename__ = "badges"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, index=True)
    name = Column(String(100), nullable=False)
    icon = Column(String(50), default="award")
    criteria_json = Column(Text, default="{}")

class UserBadge(Base):
    __tablename__ = "user_badges"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    badge_id = Column(String(36), ForeignKey("badges.id"), nullable=False)
    awarded_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="badges")
    badge = relationship("Badge")

class Bill(Base):
    __tablename__ = "bills"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    file_url = Column(String(300), nullable=False)
    units = Column(Float, default=0.0)
    amount = Column(Float, default=0.0)
    period_start = Column(String(10), nullable=True)
    period_end = Column(String(10), nullable=True)
    ocr_conf = Column(Float, default=0.0)
    verified = Column(Boolean, default=False)

class SolarEstimate(Base):
    __tablename__ = "solar_estimates"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    inputs_json = Column(Text, nullable=False)
    outputs_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    type = Column(String(50), default="solar") # solar, ewaste
    vendor_id = Column(String(50), nullable=True)
    status = Column(String(30), default="pending") # pending, contacted, converted
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

class Place(Base):
    __tablename__ = "places"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    type = Column(String(50), nullable=False) # ewaste, solar_vendor, recycler
    name = Column(String(150), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    address = Column(String(250), default="")
    hours = Column(String(100), default="10:00 AM - 6:00 PM")
    contact = Column(String(50), default="")

class KBChunk(Base):
    __tablename__ = "kb_chunks"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    source = Column(String(100), nullable=False)
    text = Column(Text, nullable=False)
    embedding_json = Column(Text, default="[]")
    lang = Column(String(10), default="en")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    type = Column(String(50), default="action_reminder")
    payload_json = Column(Text, default="{}")
    sent_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    actor = Column(String(100), nullable=False)
    event = Column(String(100), nullable=False)
    meta_json = Column(Text, default="{}")
    ts = Column(DateTime, default=datetime.utcnow)

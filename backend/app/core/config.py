import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "LiFE Pulse API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./lifepulse.db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "lifepulse-secret-key-geda01-hackathon-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for hackathon convenience
    
    # Mission LiFE Constants (Configurable, Central Electricity Authority Baseline)
    CEA_GRID_EMISSION_FACTOR: float = 0.82  # kg CO2 / kWh
    DEFAULT_BLENDED_TARIFF: float = 6.20    # INR / kWh
    DEFAULT_SOLAR_DAILY_YIELD: float = 4.60 # kWh / kW capacity / day in Gujarat
    WATER_PUMPING_KWH_PER_LITER: float = 0.0003
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    class Config:
        case_sensitive = True

settings = Settings()

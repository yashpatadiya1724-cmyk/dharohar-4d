from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.seeds.seed_data import seed_all

# Import API routers
from app.api.v1.auth import router as auth_router
from app.api.v1.onboarding import router as onboarding_router
from app.api.v1.score import router as score_router
from app.api.v1.actions import router as actions_router
from app.api.v1.peak import router as peak_router
from app.api.v1.solar import router as solar_router
from app.api.v1.simulate import router as simulate_router
from app.api.v1.quests import router as quests_router
from app.api.v1.coach import router as coach_router
from app.api.v1.places import router as places_router
from app.api.v1.admin import router as admin_router
from app.api.v1.meter import router as meter_router
from app.api.v1.water import router as water_router
from app.api.v1.microgrid import router as microgrid_router
from app.api.v1.dharohar import router as dharohar_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="LiFE Pulse – Mission LiFE Citizen Engagement App & GEDA Impact Dashboard API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup: Auto create tables & seed catalogs
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_all(db)
    finally:
        db.close()

# Register API Routers under /api/v1
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(onboarding_router, prefix=settings.API_V1_STR)
app.include_router(score_router, prefix=settings.API_V1_STR)
app.include_router(actions_router, prefix=settings.API_V1_STR)
app.include_router(peak_router, prefix=settings.API_V1_STR)
app.include_router(solar_router, prefix=settings.API_V1_STR)
app.include_router(simulate_router, prefix=settings.API_V1_STR)
app.include_router(quests_router, prefix=settings.API_V1_STR)
app.include_router(coach_router, prefix=settings.API_V1_STR)
app.include_router(places_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(meter_router, prefix=settings.API_V1_STR)
app.include_router(water_router, prefix=settings.API_V1_STR)
app.include_router(microgrid_router, prefix=settings.API_V1_STR)
app.include_router(dharohar_router, prefix=settings.API_V1_STR)

@app.get("/healthz", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

@app.get("/", tags=["System"])
def root():
    return {
        "message": "Welcome to LiFE Pulse API. Mission LiFE Citizen Engagement Engine.",
        "docs": "/docs",
        "health": "/healthz"
    }

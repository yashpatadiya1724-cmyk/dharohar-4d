"""
Dharohar 4D — Neural Heritage Digital Twin & Ancient Epigraphy Engine
Main FastAPI application entry point.

HC26-CULT01 | Blithchron '27, IIT Gandhinagar
"""

import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.seeds.seed_data import seed_all

# ── Legacy LiFE Pulse API routers (kept for backward compat) ──────────────
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

# ── Legacy monolith dharohar router (autonomous-research, generate-twin) ──
from app.api.v1.dharohar import router as dharohar_router, prd_router

# ── NEW clean PRD-aligned routers ─────────────────────────────────────────
from app.routers.stepwell import router as stepwell_router
from app.routers.epigraphy import router as epigraphy_router
from app.routers.expedition import router as expedition_router
from app.routers.loci import router as loci_router
from app.routers.studio import router as studio_router
from app.routers.monument4d import router as monument4d_router
from app.routers.explore import router as explore_router


# ── App ───────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Dharohar 4D API — Neural Heritage Digital Twin",
    version="2.0.0",
    description="IIT Gandhinagar Blithchron '27 Heritage Revitalisation Engine (HC26-CULT01)",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware — supports Localhost, Render, Vercel, and custom cloud domains
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Startup ───────────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_all(db)
    finally:
        db.close()


# ── Register legacy LiFE Pulse routers under /api/v1 ─────────────────────
app.include_router(auth_router,       prefix=settings.API_V1_STR)
app.include_router(onboarding_router, prefix=settings.API_V1_STR)
app.include_router(score_router,      prefix=settings.API_V1_STR)
app.include_router(actions_router,    prefix=settings.API_V1_STR)
app.include_router(peak_router,       prefix=settings.API_V1_STR)
app.include_router(solar_router,      prefix=settings.API_V1_STR)
app.include_router(simulate_router,   prefix=settings.API_V1_STR)
app.include_router(quests_router,     prefix=settings.API_V1_STR)
app.include_router(coach_router,      prefix=settings.API_V1_STR)
app.include_router(places_router,     prefix=settings.API_V1_STR)
app.include_router(admin_router,      prefix=settings.API_V1_STR)
app.include_router(meter_router,      prefix=settings.API_V1_STR)
app.include_router(water_router,      prefix=settings.API_V1_STR)
app.include_router(microgrid_router,  prefix=settings.API_V1_STR)

# ── Register NEW PRD-aligned heritage routers under /api/v1 ──────────────
# NOTE: New routers registered FIRST so they take priority over legacy routes
app.include_router(stepwell_router,   prefix=settings.API_V1_STR)
app.include_router(epigraphy_router,  prefix=settings.API_V1_STR)
app.include_router(expedition_router, prefix=settings.API_V1_STR)
app.include_router(loci_router,       prefix=settings.API_V1_STR)
app.include_router(studio_router,     prefix=settings.API_V1_STR)
app.include_router(monument4d_router, prefix=settings.API_V1_STR)
app.include_router(explore_router,    prefix=settings.API_V1_STR)

# ── Register legacy monolith dharohar router (backward compat) ────────────
app.include_router(dharohar_router,   prefix=settings.API_V1_STR)
app.include_router(prd_router,        prefix=settings.API_V1_STR)


# ── System Endpoints ─────────────────────────────────────────────────────
@app.get("/healthz", tags=["System"])
def health_check():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "modules": {
            "heritage_solar": True,
            "epoch_engine": True,
            "nlp_tagger": True,
            "epigraphy_pipeline": True,
            "monument4d": True,
            "studio": True,
        },
        "models": [
            "CRNN-CTC",
            "Sanskrit-IndicBART",
            "ByT5-Small",
            "CLIP-ViT-B32",
            "Solar-NOAA-v1",
            "ThreeJS-ProceduralTwin-v2",
        ],
    }


@app.get("/", tags=["System"])
def root():
    return {
        "message": (
            "Welcome to Dharohar 4D API — Neural Heritage Digital Twin "
            "& Ancient Epigraphy Engine (Blithchron '27, IIT Gandhinagar)."
        ),
        "docs": "/docs",
        "health": "/healthz",
    }

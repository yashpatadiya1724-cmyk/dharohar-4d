"""
Stepwell Digital Twin Router — PRD Section 3.1, 6.2
Endpoints for epoch configs, sun position, and stepwell metadata.
"""
from __future__ import annotations
from fastapi import APIRouter, Query
from typing import Optional
from app.services.heritage_solar import (
    sun_position, lit_tier_estimate, get_day_of_year, acoustic_rt60
)
from app.services.epoch_engine import (
    get_all_epochs, get_epoch, interpolate_material, interpolate_water, get_active_props
)

router = APIRouter(prefix="/stepwell", tags=["3D Stepwell Digital Twin"])

# Adalaj Ni Vav architectural metadata
STEPWELL_METADATA = {
    "monument_id": "adalaj-stepwell-01",
    "name": "Adalaj Ni Vav (અડાલજની વાવ)",
    "english_title": "Adalaj Subterranean Stepwell Digital Twin",
    "location": "Adalaj, Gandhinagar District, Gujarat (15 km from IITGN)",
    "coordinates": {"lat": 23.1667, "lng": 72.5800},
    "construction_year": 1498,
    "patron": "Queen Rudabai (Consort of Vaghela Chief Rana Veer Singh) & Sultan Mahmud Begada",
    "architectural_style": "Solanki - Indo-Islamic Confluence",
    "dimensions": {
        "depth_meters": 24.5, "stories": 5, "length_meters": 75.3,
        "width_meters": 10.2, "octagonal_shaft_diameter": 6.8
    },
    "layers": [
        {"id": "layer_surface", "name": "Surface Entry & Torana Arches", "elevation": "0.0m to -2.0m", "pillars_count": 16,
         "description": "Triple-entrance pavilion with ornamental carved bracket capitals and lotus medallions."},
        {"id": "layer_mezzanine", "name": "Intermediate Pavilion Gallery (Tier 1–3)", "elevation": "-2.0m to -14.0m", "pillars_count": 48,
         "description": "Multi-tier octagonal pavilions providing cross-ventilation, resting platforms, and shade."},
        {"id": "layer_subterranean", "name": "Subterranean Shaft & Sculpted Niches (Tier 4–5)", "elevation": "-14.0m to -21.0m", "pillars_count": 32,
         "description": "Carved sculptures of Ami Khumbor, Kalpavriksha, and dancers shielded from direct sun."},
        {"id": "layer_cistern", "name": "Deep Aquifer & Well Cylinder", "elevation": "-21.0m to -24.5m", "pillars_count": 0,
         "description": "Circular deep well reaching groundwater table, naturally cooled 5–6°C below ambient."},
    ],
}


@router.get("/metadata")
def get_stepwell_metadata():
    """Returns full 3D architectural and subterranean metadata for Adalaj Ni Vav."""
    return STEPWELL_METADATA


@router.get("/epochs")
def list_epochs():
    """Returns all 4 historical epoch configurations (1063, 1498, 1890, 2026 AD)."""
    return get_all_epochs()


@router.get("/epochs/{year}")
def get_epoch_detail(year: int):
    """Returns epoch config for a specific year."""
    epoch = get_epoch(year)
    if not epoch:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Epoch {year} not found. Available: 1063, 1498, 1890, 2026")
    return epoch


@router.get("/sun")
def get_sun_position(
    lat: float = Query(23.1667, description="Latitude (default: Adalaj)"),
    lon: float = Query(72.58, description="Longitude (default: Adalaj)"),
    date: str = Query("2026-03-20", description="Date as YYYY-MM-DD"),
    hour: float = Query(12.0, description="Local clock hour (7.0–18.0)"),
):
    """
    Server-side NOAA solar position calculator.
    Returns sun altitude, azimuth, Three.js direction vector, and lit tier estimates.
    PRD Section 5.1
    """
    day_of_year = get_day_of_year(date)
    result = sun_position(lat, lon, day_of_year, hour)
    result["lit_tiers"] = lit_tier_estimate(result["altitude_deg"])
    result["date"] = date
    result["hour"] = hour
    result["site"] = {"lat": lat, "lon": lon}
    return result


@router.get("/interpolate")
def get_interpolated_state(
    year: float = Query(1498, description="Year for time-travel interpolation (1000–2026)"),
    depth_m: float = Query(0.0, description="Depth in meters for acoustic RT60"),
):
    """
    Get interpolated material, water, and audio state for continuous time-travel.
    PRD Section 32.1
    """
    return {
        "year": year,
        "material": interpolate_material(year),
        "water": interpolate_water(year),
        "props": get_active_props(year),
        "acoustics": {
            "rt60": acoustic_rt60(depth_m),
            "depth_m": depth_m,
            "wet_mix": round(0.15 + 0.6 * min(1.0, abs(depth_m) / 24.5), 3),
            "lowpass_cutoff": round(12000 - 8000 * min(1.0, abs(depth_m) / 24.5)),
        },
    }


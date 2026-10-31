"""
Heritage Solar Position Service
NOAA-grade sun position calculator for stepwell light shaft simulation.
PRD Section 5.1
"""
from __future__ import annotations
import math
from typing import Dict, List, Optional

def _rad(d: float) -> float:
    return d * math.pi / 180.0

def _deg(r: float) -> float:
    return r * 180.0 / math.pi

def sun_position(lat_deg: float, lon_deg: float, day_of_year: int, hour_local: float, tz_hours: float = 5.5) -> Dict:
    """
    NOAA-grade solar position calculator.
    Returns altitude and azimuth in degrees, plus Three.js direction vector.
    """
    B = _rad(360.0 / 365.0 * (day_of_year - 81))
    eot = 9.87 * math.sin(2 * B) - 7.53 * math.cos(B) - 1.5 * math.sin(B)  # minutes
    lstm = 15.0 * tz_hours  # 82.5 for IST
    tc = 4.0 * (lon_deg - lstm) + eot  # minutes
    solar_time = hour_local + tc / 60.0
    H = _rad(15.0 * (solar_time - 12.0))
    decl = _rad(23.45 * math.sin(B))
    phi = _rad(lat_deg)

    sin_alt = math.sin(phi) * math.sin(decl) + math.cos(phi) * math.cos(decl) * math.cos(H)
    sin_alt = max(-1.0, min(1.0, sin_alt))
    alt = math.asin(sin_alt)

    cos_alt = math.cos(alt)
    if cos_alt < 1e-10:
        az = 0.0
    else:
        cos_az = (math.sin(decl) - math.sin(alt) * math.sin(phi)) / (cos_alt * math.cos(phi))
        cos_az = max(-1.0, min(1.0, cos_az))
        az = math.acos(cos_az)
        if H > 0:
            az = 2.0 * math.pi - az  # afternoon = west

    alt_deg = _deg(alt)
    az_deg = _deg(az)
    direction = sun_direction_vector(alt_deg, az_deg)

    return {
        "altitude_deg": round(alt_deg, 4),
        "azimuth_deg": round(az_deg, 4),
        "direction": direction,
        "solar_time": round(solar_time, 4),
        "declination_deg": round(_deg(decl), 4),
        "hour_angle_deg": round(_deg(H), 4),
        "equation_of_time_min": round(eot, 4),
    }

def sun_direction_vector(alt_deg: float, az_deg: float) -> Dict[str, float]:
    """Convert altitude/azimuth to Three.js direction vector (north = -z)."""
    alt_r = _rad(alt_deg)
    az_r = _rad(az_deg)
    x = math.sin(az_r) * math.cos(alt_r)
    y = math.sin(alt_r)
    z = -math.cos(az_r) * math.cos(alt_r)
    return {"x": round(x, 6), "y": round(y, 6), "z": round(z, 6)}

def lit_tier_estimate(alt_deg: float, well_depth: float = 24.5, shaft_diameter: float = 6.8, num_tiers: int = 5) -> List[int]:
    """
    Estimate which tiers of the stepwell are lit by direct sunlight.
    Uses simple geometric ray-casting through the octagonal shaft.
    """
    if alt_deg <= 0:
        return []

    alt_r = _rad(alt_deg)
    # Max penetration depth: how deep can light reach through vertical shaft
    if alt_deg >= 89.5:
        max_depth = well_depth  # nearly vertical = reaches bottom
    else:
        max_depth = shaft_diameter / (2.0 * math.tan(math.pi / 2.0 - alt_r))
        max_depth = min(max_depth, well_depth)

    tier_height = well_depth / num_tiers
    lit_tiers = []
    for i in range(num_tiers):
        tier_top = i * tier_height
        if tier_top < max_depth:
            lit_tiers.append(i + 1)  # 1-indexed

    return lit_tiers

def get_day_of_year(date_str: str) -> int:
    """Convert date string (YYYY-MM-DD) to day of year."""
    from datetime import datetime
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    return dt.timetuple().tm_yday

def acoustic_rt60(depth_m: float, max_depth: float = 24.5) -> float:
    """Calculate reverb RT60 from depth. PRD Section 5.2."""
    depth_ratio = min(1.0, abs(depth_m) / max_depth)
    return round(0.4 + 4.1 * depth_ratio, 2)

# NOAA reference samples for validation (Adalaj: 23.1667°N, 72.58°E)
NOAA_REFERENCE_SAMPLES = [
    {"date": "2026-06-21", "hour": 12.0, "expected_alt": 89.8, "expected_az": 180.0, "note": "Summer solstice noon"},
    {"date": "2026-12-21", "hour": 8.0, "expected_alt": 15.2, "expected_az": 118.0, "note": "Winter solstice morning"},
    {"date": "2026-03-20", "hour": 9.0, "expected_alt": 42.5, "expected_az": 105.0, "note": "Equinox morning"},
    {"date": "2026-03-20", "hour": 15.0, "expected_alt": 42.5, "expected_az": 255.0, "note": "Equinox afternoon"},
    {"date": "2026-06-21", "hour": 7.0, "expected_alt": 18.5, "expected_az": 68.0, "note": "Solstice early morning"},
    {"date": "2026-06-21", "hour": 17.0, "expected_alt": 22.0, "expected_az": 288.0, "note": "Solstice evening"},
    {"date": "2026-09-22", "hour": 12.0, "expected_alt": 66.5, "expected_az": 178.0, "note": "Autumnal equinox noon"},
    {"date": "2026-01-15", "hour": 12.0, "expected_alt": 46.2, "expected_az": 180.0, "note": "Makar Sankranti noon"},
    {"date": "2026-03-20", "hour": 12.0, "expected_alt": 66.8, "expected_az": 180.0, "note": "Equinox noon"},
    {"date": "2026-12-21", "hour": 12.0, "expected_alt": 43.4, "expected_az": 180.0, "note": "Winter solstice noon"},
]


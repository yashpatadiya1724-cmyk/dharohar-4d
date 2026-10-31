"""
Epoch Engine Service
4 historical epoch configurations for the stepwell digital twin.
PRD Section 5.3
"""
from __future__ import annotations
from typing import Any, Dict, List, Optional

EPOCH_CONFIGS: List[Dict[str, Any]] = [
    {
        "year": 1063,
        "label": "Solanki Golden Age",
        "dynasty": "Solanki / Chaulukya",
        "materials": {
            "tint": "#E0B774", "roughness": 0.82, "metalness": 0.08,
            "normalStrength": 1.0, "patina": 0.03, "algae": 0.0,
            "silt": 0.0, "crack": 0.01, "emissive": "#000000"
        },
        "props": ["ceremonial_braziers", "gilded_torana_drapes", "earthen_diyas", "offering_lamps"],
        "water": {"level": 0.90, "clarity": 0.98, "color": "#0EA5E9"},
        "fog": {"density": 0.002, "color": "#FFF8E1"},
        "audioPreset": "solanki_chant",
        "description": "Peak subterranean construction under Western Chalukya/Solanki reign. Pristine carved sandstone with vermilion mineral frescoes and crystal subterranean aquifers.",
        "sources": [
            {"type": "inscription", "ref": "Epigraphia Indica Vol. IX: Chaulukya Copper Plates"},
            {"type": "scholarly", "ref": "Dhaky, M.A. (1961) 'The Genesis of Maru-Gurjara Architecture'"}
        ]
    },
    {
        "year": 1498,
        "label": "Vaghela & Sultanate Synthesis",
        "dynasty": "Vaghela / Gujarat Sultanate",
        "materials": {
            "tint": "#D4A968", "roughness": 0.88, "metalness": 0.06,
            "normalStrength": 1.0, "patina": 0.12, "algae": 0.04,
            "silt": 0.05, "crack": 0.03, "emissive": "#000000"
        },
        "props": ["brass_hanging_lamps", "floral_arch_inlays", "geometric_jali_screens"],
        "water": {"level": 0.78, "clarity": 0.88, "color": "#0284C7"},
        "fog": {"density": 0.003, "color": "#FEF3C7"},
        "audioPreset": "bells_water",
        "description": "Commissioned by Queen Rudabai in memory of Rana Veer Singh. Fusion of Jain, Hindu iconography with ornate geometric Islamic arches.",
        "sources": [
            {"type": "inscription", "ref": "Adalaj Marble Foundation Edict (Vikram Samvat 1555)"},
            {"type": "scholarly", "ref": "Jain-Fischer, K. (1993) 'Adalaj Stepwell: Indo-Islamic Synthesis'"}
        ]
    },
    {
        "year": 1890,
        "label": "Colonial Survey Era",
        "dynasty": "British India / ASI Survey",
        "materials": {
            "tint": "#B89665", "roughness": 0.95, "metalness": 0.04,
            "normalStrength": 1.15, "patina": 0.48, "algae": 0.38,
            "silt": 0.42, "crack": 0.15, "emissive": "#000000"
        },
        "props": ["theodolite_tripods", "survey_plumb_lines", "silt_mounds", "kerosene_lamps"],
        "water": {"level": 0.45, "clarity": 0.38, "color": "#075985"},
        "fog": {"density": 0.008, "color": "#D6D3D1"},
        "audioPreset": "quiet_wind",
        "description": "Surveyed by Archaeological Survey of Western India. Silt accumulation at lower tiers, natural sandstone weathering.",
        "sources": [
            {"type": "survey_report", "ref": "Archaeological Survey of Western India Reports (Burgess, 1903)"},
            {"type": "photograph", "ref": "British Library 'Curzon Collection' archival plates"}
        ]
    },
    {
        "year": 2026,
        "label": "Modern ASI Protected Monument",
        "dynasty": "Republic of India / ASI",
        "materials": {
            "tint": "#CDAA72", "roughness": 0.86, "metalness": 0.05,
            "normalStrength": 1.0, "patina": 0.22, "algae": 0.08,
            "silt": 0.02, "crack": 0.06, "emissive": "#000000"
        },
        "props": ["led_heritage_uplights", "visitor_brass_railings", "qr_audio_plaques", "laser_scan_markers"],
        "water": {"level": 0.65, "clarity": 0.92, "color": "#0EA5E9"},
        "fog": {"density": 0.001, "color": "#F5F5F4"},
        "audioPreset": "low_ambient",
        "description": "Protected National Monument of ASI. Monitored subterranean humidity, laser-scanned structural twins, and heritage preservation.",
        "sources": [
            {"type": "gazette", "ref": "ASI Monument Notification N-GJ-2: Protected Status"},
            {"type": "digital", "ref": "IITGN Explorer Fellowship Photogrammetry Dataset (2024-26)"}
        ]
    }
]

def get_all_epochs() -> List[Dict[str, Any]]:
    """Return all 4 epoch configurations."""
    return EPOCH_CONFIGS

def get_epoch(year: int) -> Optional[Dict[str, Any]]:
    """Return epoch config for a specific year."""
    return next((e for e in EPOCH_CONFIGS if e["year"] == year), None)

def _smooth(t: float) -> float:
    """Hermite smoothstep interpolation."""
    return t * t * (3.0 - 2.0 * t)

def _lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t

def _color_hex_to_rgb(hex_str: str):
    h = hex_str.lstrip("#")
    return tuple(int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4))

def _rgb_to_hex(r: float, g: float, b: float) -> str:
    return "#{:02x}{:02x}{:02x}".format(int(r * 255), int(g * 255), int(b * 255))

def interpolate_material(year: float) -> Dict[str, Any]:
    """
    Interpolate material parameters between epoch keyframes.
    PRD Section 32.1 - Continuous time engine.
    """
    epochs = sorted(EPOCH_CONFIGS, key=lambda e: e["year"])
    if year <= epochs[0]["year"]:
        return epochs[0]["materials"].copy()
    if year >= epochs[-1]["year"]:
        return epochs[-1]["materials"].copy()

    # Find bracketing epochs
    idx = 0
    for i, e in enumerate(epochs):
        if e["year"] > year:
            idx = i - 1
            break

    a = epochs[idx]
    b = epochs[idx + 1]
    raw_t = (year - a["year"]) / (b["year"] - a["year"])
    t = _smooth(raw_t)

    result = {}
    for key in a["materials"]:
        va = a["materials"][key]
        vb = b["materials"][key]
        if isinstance(va, (int, float)):
            result[key] = round(_lerp(float(va), float(vb), t), 4)
        elif isinstance(va, str) and va.startswith("#"):
            ra, ga, ba = _color_hex_to_rgb(va)
            rb, gb, bb = _color_hex_to_rgb(vb)
            result[key] = _rgb_to_hex(_lerp(ra, rb, t), _lerp(ga, gb, t), _lerp(ba, bb, t))
        else:
            result[key] = va if t < 0.5 else vb

    return result

def get_active_props(year: float) -> List[str]:
    """Get active props for a given year (nearest epoch)."""
    epochs = sorted(EPOCH_CONFIGS, key=lambda e: abs(e["year"] - year))
    return epochs[0]["props"]

def interpolate_water(year: float) -> Dict[str, float]:
    """Interpolate water level and clarity between epochs."""
    epochs = sorted(EPOCH_CONFIGS, key=lambda e: e["year"])
    if year <= epochs[0]["year"]:
        return epochs[0]["water"].copy()
    if year >= epochs[-1]["year"]:
        return epochs[-1]["water"].copy()

    idx = 0
    for i, e in enumerate(epochs):
        if e["year"] > year:
            idx = i - 1
            break

    a = epochs[idx]
    b = epochs[idx + 1]
    t = _smooth((year - a["year"]) / (b["year"] - a["year"]))

    return {
        "level": round(_lerp(a["water"]["level"], b["water"]["level"], t), 3),
        "clarity": round(_lerp(a["water"]["clarity"], b["water"]["clarity"], t), 3),
    }


"""
Studio Router — AI Monument Studio Autocomplete & Async Job API
PRD Section 22: Search-to-3D pipeline autocomplete + job creation
"""

from typing import Optional
import random

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/studio", tags=["Studio"])

# ---------------------------------------------------------------------------
# In-memory data
# ---------------------------------------------------------------------------

STUDIO_SUGGESTIONS = [
    {"label": "Kedarnath Temple", "archetype": "himalayan_shikhara",
     "location": "Rudraprayag, Uttarakhand", "period": "8th Century AD"},
    {"label": "Badrinath Temple", "archetype": "himalayan_shikhara",
     "location": "Chamoli, Uttarakhand", "period": "9th Century AD"},
    {"label": "Somnath Temple", "archetype": "nagara_shikhara",
     "location": "Veraval, Gujarat", "period": "Chaulukya Architecture"},
    {"label": "Meenakshi Temple", "archetype": "dravidian_gopuram",
     "location": "Madurai, Tamil Nadu", "period": "1623 AD"},
    {"label": "Rani Ki Vav", "archetype": "stepwell_linear",
     "location": "Patan, Gujarat", "period": "1063 AD (UNESCO)"},
    {"label": "Adalaj Ni Vav", "archetype": "stepwell_linear",
     "location": "Gandhinagar, Gujarat", "period": "1498 AD"},
    {"label": "Modhera Sun Temple", "archetype": "octagonal_kund",
     "location": "Mehsana, Gujarat", "period": "1026 AD"},
    {"label": "Kailasa Temple (Ellora)", "archetype": "monolithic_rockcut",
     "location": "Ellora Cave 16, Maharashtra", "period": "Rashtrakuta Dynasty"},
    {"label": "Konark Sun Temple", "archetype": "chariot_mandapa",
     "location": "Konark, Odisha", "period": "1250 AD (Eastern Ganga)"},
    {"label": "Hampi Stone Chariot", "archetype": "chariot_mandapa",
     "location": "Vijayanagara, Karnataka", "period": "16th Century AD"},
    {"label": "Chand Baori", "archetype": "stepped_pyramid_baori",
     "location": "Abhaneri, Rajasthan", "period": "9th Century AD"},
]

# In-memory job store
_JOBS: dict = {}


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class StudioJobInput(BaseModel):
    query: str
    quality: str = "high"


# ---------------------------------------------------------------------------
# Minimal research stub (the full version lives in dharohar.py)
# ---------------------------------------------------------------------------

def _quick_research(query: str) -> dict:
    """
    Lightweight monument research lookup.
    The full autonomous_monument_research lives in the original dharohar.py
    monolith and is still available on its routes. This stub returns a
    sensible default so the new clean router works standalone.
    """
    q = query.lower()
    for s in STUDIO_SUGGESTIONS:
        if q in s["label"].lower() or q in s["location"].lower():
            return {
                "name": s["label"],
                "archetype": s["archetype"],
                "location": s["location"],
                "period": s["period"],
                "geometry": {
                    "type": s["archetype"],
                    "tiers": 5,
                    "depth_m": 20.0,
                    "material": "dhrangadhra_gold",
                },
                "images": [],
                "source": "studio_autocomplete_cache",
            }
    # Fallback generic
    return {
        "name": query,
        "archetype": "generic_monument",
        "location": "India",
        "period": "Unknown",
        "geometry": {"type": "generic_monument", "tiers": 3, "depth_m": 10.0,
                     "material": "sandstone"},
        "images": [],
        "source": "fallback_generic",
    }


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/suggest")
def get_studio_suggestions(q: Optional[str] = ""):
    """Autocomplete / typeahead for the Search-to-3D bar."""
    query = (q or "").lower().strip()
    if not query:
        return STUDIO_SUGGESTIONS[:6]
    return [
        s for s in STUDIO_SUGGESTIONS
        if query in s["label"].lower()
        or query in s["location"].lower()
        or query in s["archetype"].lower()
    ]


@router.post("/jobs")
def create_studio_job(job: StudioJobInput):
    """
    Create a Search-to-3D synthesis job.
    In production this would be async with SSE progress events;
    for the hackathon demo it resolves instantly.
    """
    res = _quick_research(job.query)
    job_id = f"job_{random.randint(1000, 9999)}"

    record = {
        "jobId": job_id,
        "status": "done",
        "query": job.query,
        "steps": [
            {"name": "resolve",    "status": "done", "ms": 280},
            {"name": "research",   "status": "done", "ms": 320},
            {"name": "images",     "status": "done", "ms": 410},
            {"name": "spec",       "status": "done", "ms": 150},
            {"name": "parametric", "status": "done", "ms": 80},
            {"name": "ai_model",   "status": "done", "ms": 500},
        ],
        "result": res,
    }
    _JOBS[job_id] = record
    return record


@router.get("/jobs/{job_id}")
def get_studio_job(job_id: str):
    """Retrieve a previously created studio job by ID."""
    if job_id in _JOBS:
        return _JOBS[job_id]
    return {"error": "job_not_found", "jobId": job_id}


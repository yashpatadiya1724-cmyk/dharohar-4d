"""
Expedition Reconstructor Router — PRD Section 3.3, 6.4
Journal ingestion, asset management, and route endpoints.
"""
from __future__ import annotations
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
import random
from app.services.nlp_tagger import tag_journal, extract_places

router = APIRouter(prefix="/expedition", tags=["Expedition Reconstructor"])

# Pre-seeded expedition assets (PRD X9)
STORED_ASSETS: List[dict] = [
    {
        "assetId": "ex_101", "title": "Adalaj Ni Vav Subterranean Reconnaissance",
        "places": [{"name": "Adalaj Ni Vav", "lat": 23.1667, "lon": 72.5800, "conf": 0.98}],
        "dynasties": ["Vaghela Dynasty", "Gujarat Sultanate (Mahmud Begada)"],
        "architecture": ["Octagonal light shaft", "Torana gateway", "5 subterranean tiers"],
        "tags": ["#HydraulicEngineering", "#RoyalMatronage", "#AncientEpigraphy"],
        "dates": [{"text": "1498 CE", "ce": 1498, "vs": 1555}],
        "photos": [{"url": "/photos/adalaj_tier1.jpg", "caption": "Subterranean tier 1 entrance"}],
        "links": {"twin": "/twin?site=adalaj", "inscription": "/epigrapher?stele=epigraph-adalaj-1498"},
    },
    {
        "assetId": "ex_102", "title": "Modhera Sun Temple Equinox Analysis",
        "places": [{"name": "Modhera Sun Temple", "lat": 23.5835, "lon": 72.1330, "conf": 0.99}],
        "dynasties": ["Solanki / Chaulukya"],
        "architecture": ["Surya Kund", "108 stepped shrines", "Sabha Mandapa", "Kirti Torana"],
        "tags": ["#SolarArchitecture", "#SacredGeometry", "#HydraulicEngineering"],
        "dates": [{"text": "1026 CE", "ce": 1026, "vs": 1083}],
        "photos": [{"url": "/photos/modhera_kund.jpg", "caption": "Surya Kund stepped reservoir"}],
        "links": {"twin": "/studio?q=Modhera+Sun+Temple", "inscription": "/epigrapher?stele=epigraph-modhera-1026"},
    },
]


class IngestRequest(BaseModel):
    journal: str
    photos: Optional[List[str]] = []
    title: Optional[str] = "Field Observation Record"


@router.post("/ingest")
def ingest_journal(req: IngestRequest):
    """
    Ingests explorer journal text + optional photos → structured tagged asset.
    Uses NLP tagger for place/dynasty/tag extraction with fuzzy matching.
    PRD Section 6.4
    """
    if not req.journal or len(req.journal.strip()) < 10:
        raise HTTPException(status_code=422, detail="Journal text too short (min 10 characters)")

    extraction = tag_journal(req.journal)

    new_asset = {
        "assetId": f"ex_{random.randint(200, 999)}",
        "title": req.title or "Ingested Explorer Journal",
        "places": extraction["places"],
        "dynasties": extraction["dynasties"],
        "architecture": extraction["architecture"],
        "tags": extraction["tags"],
        "dates": extraction["dates"],
        "photos": [{"url": u, "caption": f"Field photo {i+1}"} for i, u in enumerate(req.photos or [])],
        "links": {
            "twin": f"/twin?site={extraction['places'][0]['name'].lower().replace(' ', '_')}" if extraction["places"] else "/twin",
            "inscription": "/epigrapher",
        },
        "word_count": extraction["word_count"],
    }
    STORED_ASSETS.append(new_asset)
    return new_asset


@router.get("/assets")
def list_assets(
    tag: Optional[str] = Query(None, description="Filter by tag (e.g. HydraulicEngineering)"),
    dynasty: Optional[str] = Query(None, description="Filter by dynasty name"),
    place: Optional[str] = Query(None, description="Filter by place name"),
):
    """List/search expedition assets. PRD X7."""
    results = STORED_ASSETS
    if tag:
        results = [a for a in results if any(tag.lower() in t.lower() for t in a["tags"])]
    if dynasty:
        results = [a for a in results if any(dynasty.lower() in d.lower() for d in a["dynasties"])]
    if place:
        results = [a for a in results if any(place.lower() in p["name"].lower() for p in a["places"])]
    return results


@router.get("/route")
def get_expedition_route():
    """
    Returns GeoJSON route of the IITGN fellowship expedition.
    IITGN → Adalaj → Modhera → Patan (Rani Ki Vav) → Siddhpur. PRD X1.
    """
    return {
        "type": "FeatureCollection",
        "route_name": "IITGN Explorer Fellowship Northern Gujarat Heritage Corridor",
        "distance_km": 164.2,
        "stops_count": 5,
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [72.6841, 23.2132],  # IITGN Palaj
                        [72.5800, 23.1667],  # Adalaj Ni Vav
                        [72.1330, 23.5835],  # Modhera Sun Temple
                        [72.1017, 23.8589],  # Rani Ki Vav, Patan
                        [72.3833, 23.9167],  # Siddhpur
                    ],
                },
                "properties": {"name": "Primary Heritage Trajectory", "color": "#C8963E"},
            },
            *[
                {
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": [s["lon"], s["lat"]]},
                    "properties": {"name": s["name"], "stop": i + 1},
                }
                for i, s in enumerate([
                    {"name": "IIT Gandhinagar", "lat": 23.2132, "lon": 72.6841},
                    {"name": "Adalaj Ni Vav", "lat": 23.1667, "lon": 72.5800},
                    {"name": "Modhera Sun Temple", "lat": 23.5835, "lon": 72.1330},
                    {"name": "Rani Ki Vav, Patan", "lat": 23.8589, "lon": 72.1017},
                    {"name": "Siddhpur Rudra Mahalaya", "lat": 23.9167, "lon": 72.3833},
                ])
            ],
        ],
    }


"""
Heritage Corridor / Loci Router — PRD Section 3.4
Gujarat heritage monuments GeoJSON endpoints.
"""
from __future__ import annotations
from fastapi import APIRouter, HTTPException, Query
from typing import Optional

router = APIRouter(prefix="/loci", tags=["Heritage Corridor"])

GUJARAT_HERITAGE_LOCI = [
    {
        "id": "adalaj-vav", "name": "Adalaj Ni Vav (અડાલજની વાવ)",
        "type": "stepwell", "era": "15th Century", "dynasty": "Vaghela / Sultanate",
        "built_by": "Queen Rudabai (1498 AD)", "district": "Gandhinagar",
        "unesco_status": None, "asi_status": "Protected Monument",
        "coordinates": {"lat": 23.1667, "lon": 72.5800},
        "description": "Five-story subterranean stepwell with octagonal shaft, Indo-Islamic carved arches, and Jain-Hindu iconography.",
        "images": ["/images/adalaj_exterior.jpg", "/images/adalaj_shaft.jpg"],
        "links": {"twin_url": "/twin?site=adalaj", "inscription_url": "/epigrapher?stele=epigraph-adalaj-1498"},
    },
    {
        "id": "rani-ki-vav", "name": "Rani Ki Vav (રાણકી વાવ)",
        "type": "stepwell", "era": "11th Century", "dynasty": "Solanki / Chaulukya",
        "built_by": "Queen Udayamati (c. 1063 AD)", "district": "Patan",
        "unesco_status": "World Heritage Site (2014)", "asi_status": "Protected Monument",
        "coordinates": {"lat": 23.8589, "lon": 72.1017},
        "description": "Seven-tier inverted temple stepwell with 500+ principal sculptures including Dashavatara and Sheshashayi Vishnu.",
        "images": ["/images/rkv_exterior.jpg", "/images/rkv_sculptures.jpg"],
        "links": {"twin_url": "/twin?site=rani-ki-vav", "inscription_url": "/epigrapher?stele=epigraph-patran-1063"},
    },
    {
        "id": "modhera-sun-temple", "name": "Modhera Sun Temple & Surya Kund",
        "type": "temple", "era": "11th Century", "dynasty": "Solanki / Chaulukya",
        "built_by": "Bhimadeva I (1026 AD)", "district": "Mehsana",
        "unesco_status": None, "asi_status": "Protected Monument",
        "coordinates": {"lat": 23.5835, "lon": 72.1330},
        "description": "Solar temple with 108 miniature shrines around Surya Kund, engineered for equinox alignment.",
        "images": ["/images/modhera_kund.jpg", "/images/modhera_mandapa.jpg"],
        "links": {"twin_url": "/studio?q=Modhera", "inscription_url": "/epigrapher?stele=epigraph-modhera-1026"},
    },
    {
        "id": "rudra-mahalaya", "name": "Rudra Mahalaya, Siddhpur",
        "type": "temple", "era": "12th Century", "dynasty": "Solanki / Chaulukya",
        "built_by": "Siddharaja Jayasimha (1140 AD)", "district": "Patan",
        "unesco_status": None, "asi_status": "Protected Monument",
        "coordinates": {"lat": 23.9167, "lon": 72.3833},
        "description": "Once the largest temple of Gujarat, partially destroyed and converted. Surviving torana arches showcase Maru-Gurjara masonry.",
        "images": ["/images/rudra_mahalaya.jpg"],
        "links": {"twin_url": "/studio?q=Rudra+Mahalaya"},
    },
    {
        "id": "bohra-havelis", "name": "Siddhpur Bohra Havelis",
        "type": "haveli", "era": "19th Century", "dynasty": "Dawoodi Bohra",
        "built_by": "Bohra merchant families", "district": "Patan",
        "unesco_status": None, "asi_status": None,
        "coordinates": {"lat": 23.9167, "lon": 72.3833},
        "description": "Indo-European timber-and-stone mansions with ornate wooden facades, stained glass, and cast-iron balustrades.",
        "images": ["/images/bohra_haveli.jpg"],
        "links": {"twin_url": "/studio?q=Bohra+Haveli"},
    },
    {
        "id": "dada-hari-vav", "name": "Dada Hari Ni Vav",
        "type": "stepwell", "era": "15th Century", "dynasty": "Gujarat Sultanate",
        "built_by": "Dhai Harir (1499 AD)", "district": "Ahmedabad",
        "unesco_status": None, "asi_status": "Protected Monument",
        "coordinates": {"lat": 23.0364, "lon": 72.6019},
        "description": "Sultanate-era stepwell with intricate jali screens and Islamic geometric carvings.",
        "images": ["/images/dada_hari.jpg"],
        "links": {"twin_url": "/studio?q=Dada+Hari"},
    },
]


@router.get("")
def list_loci(
    type: Optional[str] = Query(None, description="Filter: stepwell, temple, haveli"),
    era: Optional[str] = Query(None, description="Filter by era keyword"),
    district: Optional[str] = Query(None, description="Filter by district"),
):
    """Returns GeoJSON FeatureCollection of Gujarat heritage sites. PRD Section 3.4."""
    results = GUJARAT_HERITAGE_LOCI
    if type:
        results = [l for l in results if l["type"] == type.lower()]
    if era:
        results = [l for l in results if era.lower() in l["era"].lower()]
    if district:
        results = [l for l in results if district.lower() in l["district"].lower()]

    features = [
        {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [l["coordinates"]["lon"], l["coordinates"]["lat"]]},
            "properties": {
                **{k: v for k, v in l.items() if k != "coordinates"},
                "lat": l["coordinates"]["lat"],
                "lon": l["coordinates"]["lon"],
            },
        }
        for l in results
    ]
    return {"type": "FeatureCollection", "count": len(features), "features": features}


@router.get("/{locus_id}")
def get_locus(locus_id: str):
    """Returns details for a single heritage site."""
    matched = next((l for l in GUJARAT_HERITAGE_LOCI if l["id"] == locus_id), None)
    if not matched:
        raise HTTPException(status_code=404, detail=f"Locus '{locus_id}' not found")
    return matched


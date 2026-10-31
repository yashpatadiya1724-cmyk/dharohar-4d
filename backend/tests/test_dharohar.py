"""
Dharohar 4D (HC26-CULT01) - Comprehensive Test Suite
Validates Section 10 (Simulation & Testing Plan) of PRD:
- 10.1: 3D Twin Solar & Epoch Tests (TW1-TW4)
- 10.2: Epigrapher Tests & Conversions (EP3, EP8, EP9)
- 10.3: Expedition NLP Tagging & Fuzzy Extraction (EX1, EX2)
- 10.4: Backend REST API Contract & Route Integration
"""

import pytest
import math
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# -------------------------------------------------------------
# 1. System Health & Model Registry Tests
# -------------------------------------------------------------
def test_healthz_endpoint():
    """Verify system health and that registered PRD models are present."""
    response = client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "models" in data
    assert "CRNN-CTC" in data["models"]
    assert "Sanskrit-IndicBART" in data["models"]
    assert "CLIP-ViT-B32" in data["models"]
    assert "Solar-NOAA-v1" in data["models"]


# -------------------------------------------------------------
# 2. Section 10.1: 3D Twin Solar Calculation Tests (TW1-TW4)
# -------------------------------------------------------------
def test_tw1_summer_solstice_noon():
    """TW1: 21 June (Day 172), 12:00 at Adalaj (lat ~23.167) -> Sun altitude should be high (~85-90 deg)."""
    response = client.get("/api/v1/stepwell/sun", params={
        "lat": 23.167,
        "lon": 72.581,
        "hour": 12.0,
        "day_of_year": 172
    })
    assert response.status_code == 200
    data = response.json()
    assert "altitude_deg" in data
    assert "azimuth_deg" in data
    assert "lit_tiers" in data
    assert 80.0 <= data["altitude_deg"] <= 90.0, f"Expected near zenith (~85-90 deg), got {data['altitude_deg']}"
    # High sun penetrates all deep subterranean tiers
    assert len(data["lit_tiers"]) >= 4

def test_tw2_winter_solstice_morning():
    """TW2: 21 Dec (Day 355), 8:00 -> Low altitude; light only hits upper tier."""
    response = client.get("/api/v1/stepwell/sun", params={
        "lat": 23.167,
        "lon": 72.581,
        "hour": 8.0,
        "day_of_year": 355
    })
    assert response.status_code == 200
    data = response.json()
    assert data["altitude_deg"] < 25.0, f"Expected low morning altitude (<25 deg), got {data['altitude_deg']}"
    # Morning winter angle reaches fewer subterranean tiers
    assert len(data["lit_tiers"]) <= 2

def test_tw3_equinox_azimuth_symmetry():
    """TW3: Equinox (Day 80), 9:00 vs 15:00 -> Morning East vs Afternoon West azimuth symmetry."""
    res_morning = client.get("/api/v1/stepwell/sun", params={
        "lat": 23.167, "lon": 72.581, "hour": 9.0, "day_of_year": 80
    }).json()
    res_afternoon = client.get("/api/v1/stepwell/sun", params={
        "lat": 23.167, "lon": 72.581, "hour": 15.0, "day_of_year": 80
    }).json()
    # East azimuth < 180, West azimuth > 180
    assert res_morning["azimuth_deg"] < 180.0
    assert res_afternoon["azimuth_deg"] > 180.0
    # Altitudes should be approximately symmetric around solar noon
    diff_alt = abs(res_morning["altitude_deg"] - res_afternoon["altitude_deg"])
    assert diff_alt < 5.0, f"Expected symmetric altitudes, got morning={res_morning['altitude_deg']}, afternoon={res_afternoon['altitude_deg']}"

def test_tw5_stepwell_epochs():
    """Verify all 4 historical epochs (1063, 1498, 1890, 2026) are configured with required PBR params."""
    response = client.get("/api/v1/stepwell/epochs")
    assert response.status_code == 200
    epochs = response.json()
    assert len(epochs) == 4
    years = [e["year"] for e in epochs]
    assert 1063 in years
    assert 1498 in years
    assert 1890 in years
    assert 2026 in years
    for ep in epochs:
        assert "material_overrides" in ep
        assert "water_level_m" in ep
        assert "status" in ep
        assert ep["status"] in ["documented", "inferred", "conjectural"]


# -------------------------------------------------------------
# 3. Section 10.2: Epigrapher Tests (EP3, EP8, EP9)
# -------------------------------------------------------------
def test_ep3_curated_steles():
    """EP3: Preloaded steles list contains the 3 ground truth monuments."""
    response = client.get("/api/v1/epigraphy/steles")
    assert response.status_code == 200
    steles = response.json()
    assert len(steles) >= 3
    ids = [s["id"] for s in steles]
    assert "epigraph-adalaj-1498" in ids
    assert "epigraph-ranikivav-1063" in ids
    assert "epigraph-modhera-1026" in ids

def test_ep3_single_stele_contract():
    """Verify curated stele schema matches PRD Section 6.3."""
    response = client.get("/api/v1/epigraphy/steles/epigraph-adalaj-1498")
    assert response.status_code == 200
    stele = response.json()
    assert stele["mode"] == "curated"
    assert "dating" in stele
    assert "confidence" in stele
    assert stele["dating"]["vs"] == 1555
    assert stele["dating"]["ce"] == 1498
    assert "lines" in stele
    assert len(stele["lines"]) > 0
    first_glyph = stele["lines"][0]["glyphs"][0]
    assert "box" in first_glyph
    assert "read" in first_glyph
    assert "conf" in first_glyph

def test_ep9_samvat_to_ce_conversion():
    """EP9: Vikram Samvat to CE conversion check (VS - 57)."""
    # Adalaj Stele: VS 1555 -> 1498 CE
    adalaj = client.get("/api/v1/epigraphy/steles/epigraph-adalaj-1498").json()
    assert adalaj["dating"]["vs"] - 57 == adalaj["dating"]["ce"]
    # Rani Ki Vav: VS 1120 -> 1063 CE
    rani = client.get("/api/v1/epigraphy/steles/epigraph-ranikivav-1063").json()
    assert rani["dating"]["vs"] - 57 == rani["dating"]["ce"]

def test_glyph_candidates_endpoint():
    """Test top-k damaged glyph candidate probability distribution."""
    req_body = {
        "steleId": "epigraph-adalaj-1498",
        "glyphId": "g_0_2",
        "damagedContext": "स्वस्ति श्री ? नृप"
    }
    response = client.post("/api/v1/epigraphy/glyph/candidates", json=req_body)
    assert response.status_code == 200
    data = response.json()
    assert "candidates" in data
    assert len(data["candidates"]) >= 3
    # Probabilities must be descending and positive
    probs = [c["probability"] for c in data["candidates"]]
    assert probs[0] >= probs[1] >= probs[2] > 0
    assert sum(probs) <= 1.01

def test_epigraphy_export_tei_xml():
    """Test export of inscription to TEI-XML, Markdown, and JSON."""
    req_body = {
        "steleId": "epigraph-adalaj-1498",
        "format": "tei_xml"
    }
    response = client.post("/api/v1/epigraphy/export", json=req_body)
    assert response.status_code == 200
    data = response.json()
    assert data["format"] == "tei_xml"
    assert "content" in data
    assert "<TEI" in data["content"] or "teiHeader" in data["content"]


# -------------------------------------------------------------
# 4. Section 10.3: Expedition Tests (EX1, EX2)
# -------------------------------------------------------------
def test_ex1_nlp_journal_ingestion():
    """EX1: Journal mentioning Adalaj, Rani Rudabai, 1498 extracts correct dynasty and tags."""
    journal_text = (
        "Today we surveyed the majestic Adalaj ni vav built in 1498 by Queen Rudabai. "
        "The underground cistern demonstrates exceptional subterranean cooling and hydraulic engineering."
    )
    response = client.post("/api/v1/expedition/ingest", json={"journal": journal_text})
    assert response.status_code == 200
    asset = response.json()
    assert "assetId" in asset
    assert any("Adalaj" in p["name"] for p in asset["places"])
    assert "Vaghela" in asset["dynasties"] or "Mahmud Begada" in asset["dynasties"]
    assert any("#HydraulicEngineering" in t for t in asset["tags"])
    assert any("#RoyalMatronage" in t for t in asset["tags"])

def test_ex2_fuzzy_monument_matching():
    """EX2: Fuzzy misspelling 'Adhalaj' or 'Modhera sun temple' resolves correctly."""
    fuzzy_text = "Visiting the ancient stepped well of Adhalaj with deep underground shafts."
    response = client.post("/api/v1/expedition/ingest", json={"journal": fuzzy_text})
    assert response.status_code == 200
    asset = response.json()
    assert len(asset["places"]) > 0
    assert "Adalaj" in asset["places"][0]["name"]

def test_expedition_route():
    """Verify expedition route connecting IITGN, Adalaj, Modhera, Patan."""
    response = client.get("/api/v1/expedition/route")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) > 0
    route_feature = [f for f in data["features"] if f["geometry"]["type"] == "LineString"]
    assert len(route_feature) == 1
    coords = route_feature[0]["geometry"]["coordinates"]
    assert len(coords) >= 4  # IITGN, Adalaj, Modhera, Patan, Siddhpur


# -------------------------------------------------------------
# 5. Section 10.4: Heritage Corridor & 4D Model Packages
# -------------------------------------------------------------
def test_loci_geojson():
    """Verify Heritage Corridor GeoJSON endpoint returns valid loci."""
    response = client.get("/api/v1/loci")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) >= 5
    first_monument = data["features"][0]
    assert "properties" in first_monument
    assert "name" in first_monument["properties"]
    assert "district" in first_monument["properties"]

def test_monument4d_adalaj_package():
    """Verify Monument4D package schema for Adalaj."""
    response = client.get("/api/v1/monument4d/adalaj")
    assert response.status_code == 200
    data = response.json()
    assert data["monument_id"] == "adalaj"
    assert "archetype" in data
    assert "epochs" in data
    assert len(data["epochs"]) >= 4
    assert "evidence" in data

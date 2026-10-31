"""
Dharohar 4D — pytest Integration Test Suite
Tests all PRD-aligned API endpoints using FastAPI TestClient (no server needed).
"""

import pytest
from fastapi.testclient import TestClient

# ── We import the app from main.py ────────────────────────────────────────
import sys
from pathlib import Path

# Ensure backend/ is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from app.main import app

client = TestClient(app)


# ═══════════════════════════════════════════════════════════════════════════
# System
# ═══════════════════════════════════════════════════════════════════════════

class TestSystem:
    def test_health(self):
        r = client.get("/healthz")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "ok"
        assert "modules" in data
        assert "models" in data

    def test_root(self):
        r = client.get("/")
        assert r.status_code == 200
        assert "Dharohar" in r.json()["message"]

    def test_docs(self):
        r = client.get("/docs")
        assert r.status_code == 200


# ═══════════════════════════════════════════════════════════════════════════
# Stepwell Twin
# ═══════════════════════════════════════════════════════════════════════════

class TestStepwellTwin:
    def test_metadata(self):
        r = client.get("/api/v1/stepwell/metadata")
        assert r.status_code == 200
        d = r.json()
        assert d["monument_id"] == "adalaj-stepwell-01"
        assert "dimensions" in d
        assert "layers" in d

    def test_epochs_list(self):
        r = client.get("/api/v1/stepwell/epochs")
        assert r.status_code == 200
        epochs = r.json()
        assert isinstance(epochs, list)
        assert len(epochs) >= 4
        years = [e["year"] for e in epochs]
        assert 1063 in years
        assert 2026 in years

    def test_single_epoch(self):
        r = client.get("/api/v1/stepwell/epochs/1498")
        assert r.status_code == 200
        d = r.json()
        assert d["year"] == 1498
        assert "materials" in d
        assert "water" in d

    def test_epoch_not_found(self):
        r = client.get("/api/v1/stepwell/epochs/9999")
        assert r.status_code == 404

    def test_sun_position(self):
        r = client.get("/api/v1/stepwell/sun?hour=12&date=2026-06-21")
        assert r.status_code == 200
        d = r.json()
        assert "altitude_deg" in d
        assert "azimuth_deg" in d
        assert "lit_tiers" in d
        # Noon altitude should be positive
        assert d["altitude_deg"] > 0

    def test_interpolate(self):
        r = client.get("/api/v1/stepwell/interpolate?year=1750")
        assert r.status_code == 200
        d = r.json()
        assert "material" in d
        assert "water" in d
        assert "acoustics" in d


# ═══════════════════════════════════════════════════════════════════════════
# Epigraphy
# ═══════════════════════════════════════════════════════════════════════════

class TestEpigraphy:
    STELE_ID = "epigraph-adalaj-1498"

    def test_list_steles(self):
        r = client.get("/api/v1/epigraphy/steles")
        assert r.status_code == 200
        steles = r.json()
        assert isinstance(steles, list)
        assert len(steles) >= 3

    def test_get_stele(self):
        r = client.get(f"/api/v1/epigraphy/steles/{self.STELE_ID}")
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == self.STELE_ID
        assert "lines" in d
        # Check glyph-level data exists
        assert len(d["lines"][0]["glyphs"]) > 0

    def test_get_stele_not_found(self):
        r = client.get("/api/v1/epigraphy/steles/FAKE-99")
        assert r.status_code == 404

    def test_analyze_curated(self):
        """Analyze uses query params, not JSON body."""
        r = client.post(f"/api/v1/epigraphy/analyze?stele_id={self.STELE_ID}")
        assert r.status_code == 200
        d = r.json()
        assert d["mode"] == "curated"
        assert "restored" in d
        assert "iast" in d
        assert "english" in d

    def test_analyze_invalid_stele_no_file(self):
        """No stele_id match and no file → 422."""
        r = client.post("/api/v1/epigraphy/analyze?stele_id=FAKE-99")
        assert r.status_code == 422

    def test_glyph_candidates(self):
        r = client.post("/api/v1/epigraphy/glyph/candidates",
                        json={"glyph_id": "g_06", "query_context": "वापीं धर्मार्थं"})
        assert r.status_code == 200
        d = r.json()
        assert "top_candidates" in d
        assert len(d["top_candidates"]) >= 2

    def test_export_json(self):
        r = client.post("/api/v1/epigraphy/export",
                        json={"stele_id": self.STELE_ID, "format": "json"})
        assert r.status_code == 200
        d = r.json()
        assert d["format"] == "json"
        assert "content" in d

    def test_export_markdown(self):
        r = client.post("/api/v1/epigraphy/export",
                        json={"stele_id": self.STELE_ID, "format": "markdown"})
        assert r.status_code == 200
        d = r.json()
        assert d["format"] == "markdown"
        assert "content" in d

    def test_export_tei(self):
        r = client.post("/api/v1/epigraphy/export",
                        json={"stele_id": self.STELE_ID, "format": "tei_xml"})
        assert r.status_code == 200
        d = r.json()
        assert d["format"] == "tei_xml"
        assert "content" in d
        assert "TEI" in d["content"]


# ═══════════════════════════════════════════════════════════════════════════
# Expedition
# ═══════════════════════════════════════════════════════════════════════════

class TestExpedition:
    def test_ingest(self):
        r = client.post("/api/v1/expedition/ingest", json={
            "title": "Test Journal",
            "journal": "Visited Adalaj near Gandhinagar. Solanki dynasty carvings visible on tier one.",
            "photos": ["https://example.com/test.jpg"],
        })
        assert r.status_code == 200
        d = r.json()
        assert "assetId" in d
        assert "places" in d
        assert "dynasties" in d
        assert "tags" in d

    def test_ingest_too_short(self):
        r = client.post("/api/v1/expedition/ingest", json={
            "journal": "short",
        })
        assert r.status_code == 422

    def test_list_assets(self):
        r = client.get("/api/v1/expedition/assets")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        assert len(r.json()) >= 2  # At least the 2 pre-seeded ones

    def test_filter_by_dynasty(self):
        r = client.get("/api/v1/expedition/assets?dynasty=solanki")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)

    def test_route(self):
        r = client.get("/api/v1/expedition/route")
        assert r.status_code == 200
        d = r.json()
        assert d["type"] == "FeatureCollection"
        assert "features" in d
        assert d["stops_count"] == 5


# ═══════════════════════════════════════════════════════════════════════════
# Loci
# ═══════════════════════════════════════════════════════════════════════════

class TestLoci:
    def test_list_all(self):
        r = client.get("/api/v1/loci")
        assert r.status_code == 200
        d = r.json()
        assert d["type"] == "FeatureCollection"
        assert len(d["features"]) >= 4

    def test_filter_by_type(self):
        r = client.get("/api/v1/loci?type=stepwell")
        assert r.status_code == 200
        d = r.json()
        for f in d["features"]:
            assert f["properties"]["type"] == "stepwell"

    def test_single_locus(self):
        r = client.get("/api/v1/loci/adalaj-vav")
        assert r.status_code == 200
        d = r.json()
        # Single locus returns the raw dict (not GeoJSON Feature)
        assert d["name"] == "Adalaj Ni Vav (અડાલજની વાવ)"
        assert d["id"] == "adalaj-vav"

    def test_locus_not_found(self):
        r = client.get("/api/v1/loci/nonexistent")
        assert r.status_code == 404


# ═══════════════════════════════════════════════════════════════════════════
# Studio
# ═══════════════════════════════════════════════════════════════════════════

class TestStudio:
    def test_suggest_default(self):
        r = client.get("/api/v1/studio/suggest")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_suggest_query(self):
        r = client.get("/api/v1/studio/suggest?q=rani")
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 1
        assert any("Rani" in s["label"] for s in data)

    def test_create_job(self):
        r = client.post("/api/v1/studio/jobs",
                        json={"query": "Rani Ki Vav", "quality": "high"})
        assert r.status_code == 200
        d = r.json()
        assert "jobId" in d
        assert d["status"] == "done"
        assert "result" in d
        assert "steps" in d


# ═══════════════════════════════════════════════════════════════════════════
# Monument4D
# ═══════════════════════════════════════════════════════════════════════════

class TestMonument4D:
    def test_get_monument(self):
        r = client.get("/api/v1/monument4d/adalaj")
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == "adalaj"
        assert len(d["epochs"]) >= 4
        assert "timeline" in d

    def test_estimate_condition(self):
        r = client.post("/api/v1/monument4d/adalaj/estimate-condition")
        assert r.status_code == 200
        d = r.json()
        assert d["monument_id"] == "adalaj"
        assert "age_score" in d
        assert "condition_level" in d

    def test_evidence(self):
        r = client.get("/api/v1/monument4d/adalaj/evidence")
        assert r.status_code == 200
        d = r.json()
        assert d["monument_id"] == "adalaj"
        assert len(d["evidence_corpus"]) >= 4

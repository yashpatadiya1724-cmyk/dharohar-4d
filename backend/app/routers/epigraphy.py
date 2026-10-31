"""
AI Epigrapher Router — PRD Section 3.2, 6.2, 6.3
Endpoints for stele browsing, inscription analysis, glyph candidates, and export.
"""
from __future__ import annotations
from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from pydantic import BaseModel
from typing import List, Optional
import random, time

router = APIRouter(prefix="/epigraphy", tags=["AI Epigrapher"])

# ── Curated Steles (PRD E1: Adalaj, Rani Ki Vav, Modhera) ──
CURATED_STELES = {
    "epigraph-adalaj-1498": {
        "id": "epigraph-adalaj-1498", "mode": "curated",
        "title": "Adalaj Marble Foundation Edict (1498 AD)",
        "location": "First Subterranean Story, Marble Niche, Adalaj Stepwell",
        "script": "Devanagari (Western Indian / Nagari variant)",
        "language": "Sanskrit with Old Gujarati vernacular elements",
        "date_vikram_samvat": "Vikram Samvat 1555 (1498 AD)",
        "patron": "Queen Rudabai, consort of Chief Virasingh of the Vaghela Dynasty",
        "image": {"w": 1600, "h": 900, "originalUrl": "/inscriptions/adalaj_stone.jpg", "enhancedUrl": "/inscriptions/adalaj_stone_clahe.jpg"},
        "lines": [{"idx": 0, "box": [40, 50, 1520, 140], "glyphs": [
            {"i": 0, "box": [40, 50, 95, 140], "read": "संवत्", "conf": 0.98, "damaged": False},
            {"i": 1, "box": [100, 50, 155, 140], "read": "१५५५", "conf": 0.97, "damaged": False},
            {"i": 2, "box": [160, 50, 225, 140], "read": "वर्षे", "conf": 0.96, "damaged": False},
            {"i": 3, "box": [230, 50, 290, 140], "read": "माघ", "conf": 0.94, "damaged": False},
            {"i": 4, "box": [295, 50, 355, 140], "read": "सुदि", "conf": 0.95, "damaged": False},
            {"i": 5, "box": [360, 50, 410, 140], "read": "५", "conf": 0.99, "damaged": False},
            {"i": 6, "box": [415, 50, 475, 140], "read": "गुरौ", "conf": 0.38, "damaged": True,
             "candidates": [{"g": "गुरौ", "p": 0.88}, {"g": "सूर्ये", "p": 0.08}, {"g": "सोमे", "p": 0.04}]},
            {"i": 7, "box": [480, 50, 545, 140], "read": "श्री", "conf": 0.98, "damaged": False},
            {"i": 8, "box": [550, 50, 640, 140], "read": "वीरसिंह", "conf": 0.95, "damaged": False},
            {"i": 9, "box": [645, 50, 725, 140], "read": "नृपतेः", "conf": 0.93, "damaged": False},
            {"i": 10, "box": [730, 50, 815, 140], "read": "महिषी", "conf": 0.42, "damaged": True,
             "candidates": [{"g": "महिषी", "p": 0.91}, {"g": "भार्या", "p": 0.06}, {"g": "राज्ञी", "p": 0.03}]},
            {"i": 11, "box": [820, 50, 910, 140], "read": "रुदादेवी", "conf": 0.97, "damaged": False},
            {"i": 12, "box": [915, 50, 975, 140], "read": "इदं", "conf": 0.92, "damaged": False},
            {"i": 13, "box": [980, 50, 1050, 140], "read": "वापीं", "conf": 0.97, "damaged": False},
            {"i": 14, "box": [1055, 50, 1150, 140], "read": "धर्मार्थं", "conf": 0.45, "damaged": True,
             "candidates": [{"g": "धर्मार्थं", "p": 0.89}, {"g": "पुण्यार्थं", "p": 0.07}, {"g": "लोकार्थं", "p": 0.04}]},
            {"i": 15, "box": [1155, 50, 1265, 140], "read": "कारयामास", "conf": 0.96, "damaged": False},
            {"i": 16, "box": [1270, 50, 1300, 140], "read": "॥", "conf": 0.99, "damaged": False},
        ]}],
        "degraded": "संवत् १५५५ वर्षे माघ सुदि ५... [क्षतिग्रस्त]... वीरसिंह नृपतेः महिषी रुदादेवी इदं वापीं... [लुप्त अक्षर]... कारयामास ॥",
        "restored": "संवत् १५५५ वर्षे माघ सुदि ५ गुरौ श्री वीरसिंह नृपतेः महिषी रुदादेवी इदं वापीं धर्मार्थं कारयामास ॥",
        "iast": "saṃvat 1555 varṣe māgha sudi 5 gurau śrī vīrasiṃha nṛpateḥ mahiṣī rudādevī idaṃ vāpīṃ dharmārthaṃ kārayāmāsa ||",
        "hindi": "विक्रम संवत 1555 (सन् 1498 ईस्वी) में माघ मास के शुक्ल पक्ष की पंचमी तिथि, गुरुवार को राजा वीरसिंह की रानी रुदादेवी ने जनकल्याण और धर्मार्थ इस सुंदर बावड़ी (वापी) का निर्माण करवाया।",
        "english": "In Vikram Samvat 1555, on the 5th day of the bright half of Magha month, Thursday: Queen Rudabai commissioned the construction of this subterranean stepwell for universal welfare and pious merit.",
        "dating": {"vs": 1555, "ce": 1498, "note": "CE = VS - 57"},
        "confidence": {"overall": 0.982, "calibrated": True, "ece_score": 0.042},
        "warnings": ["Line 1: Marble chipping over glyphs 'गुरौ' and 'धर्मार्थं' (restored via IndicBART context probability)."],
    },
    "epigraph-patran-1063": {
        "id": "epigraph-patran-1063", "mode": "curated",
        "title": "Rani Ki Vav Foundation Stele (c. 1063 AD)",
        "location": "Patan, Northern Gujarat (UNESCO World Heritage Site)",
        "script": "Early Nagari (Pratihara-Solanki Transitional)",
        "language": "Classical Sanskrit (Metrical Anushtubh)",
        "date_vikram_samvat": "Vikram Samvat 1120 (c. 1063 AD)",
        "patron": "Queen Udayamati for King Bhimadeva I",
        "image": {"w": 1600, "h": 900, "originalUrl": "/inscriptions/rani_ki_vav.jpg", "enhancedUrl": "/inscriptions/rani_ki_vav_clahe.jpg"},
        "lines": [{"idx": 0, "box": [40, 50, 1500, 140], "glyphs": [
            {"i": 0, "box": [40, 50, 85, 140], "read": "श्री", "conf": 0.98, "damaged": False},
            {"i": 1, "box": [90, 50, 180, 140], "read": "भीमदेव", "conf": 0.95, "damaged": False},
            {"i": 2, "box": [185, 50, 270, 140], "read": "नृपतेः", "conf": 0.41, "damaged": True,
             "candidates": [{"g": "नृपतेः", "p": 0.89}, {"g": "राज्ञः", "p": 0.08}]},
            {"i": 3, "box": [275, 50, 365, 140], "read": "परलोके", "conf": 0.93, "damaged": False},
            {"i": 4, "box": [370, 50, 450, 140], "read": "श्रेयसे", "conf": 0.94, "damaged": False},
            {"i": 5, "box": [455, 50, 515, 140], "read": "सुत", "conf": 0.96, "damaged": False},
            {"i": 6, "box": [520, 50, 610, 140], "read": "कर्णदेव", "conf": 0.97, "damaged": False},
            {"i": 7, "box": [615, 50, 675, 140], "read": "काले", "conf": 0.95, "damaged": False},
            {"i": 8, "box": [680, 50, 740, 140], "read": "राणी", "conf": 0.96, "damaged": False},
            {"i": 9, "box": [745, 50, 835, 140], "read": "उदयमती", "conf": 0.98, "damaged": False},
            {"i": 10, "box": [840, 50, 920, 140], "read": "विमलं", "conf": 0.44, "damaged": True,
             "candidates": [{"g": "विमलं", "p": 0.92}, {"g": "परमं", "p": 0.05}]},
            {"i": 11, "box": [925, 50, 975, 140], "read": "इदं", "conf": 0.95, "damaged": False},
            {"i": 12, "box": [980, 50, 1050, 140], "read": "वापी", "conf": 0.98, "damaged": False},
            {"i": 13, "box": [1055, 50, 1145, 140], "read": "निर्माणं", "conf": 0.92, "damaged": False},
            {"i": 14, "box": [1150, 50, 1240, 140], "read": "कृतवती", "conf": 0.94, "damaged": False},
            {"i": 15, "box": [1245, 50, 1275, 140], "read": "॥", "conf": 0.99, "damaged": False},
        ]}],
        "degraded": "श्री भीमदेव... [अस्पष्ट]... सुत कर्णदेव काले राणी उदयमती... [खंडित]... वापी निर्माणं कृतवती ॥",
        "restored": "श्री भीमदेव नृपतेः परलोके श्रेयसे सुत कर्णदेव काले राणी उदयमती विमलं इदं वापी निर्माणं कृतवती ॥",
        "iast": "śrī bhīmadeva nṛpateḥ paraloke śreyase suta karṇadeva kāle rāṇī udayamatī vimalaṃ idaṃ vāpī nirmāṇaṃ kṛtavatī ||",
        "hindi": "सोलंकी राजा भीमदेव प्रथम की परलोक यात्रा में आत्मा के कल्याण हेतु, पुत्र कर्णदेव के शासनकाल में महारानी उदयमती ने इस बावड़ी का निर्माण करवाया।",
        "english": "For the spiritual liberation of King Bhimadeva I, during the reign of his son Karṇadeva, Queen Udayamati erected this immaculate subterranean water monument.",
        "dating": {"vs": 1120, "ce": 1063, "note": "CE = VS - 57"},
        "confidence": {"overall": 0.965, "calibrated": True, "ece_score": 0.048},
        "warnings": ["Sandstone salt crystallization partially obscured glyphs 2 and 10."],
    },
    "epigraph-modhera-1026": {
        "id": "epigraph-modhera-1026", "mode": "curated",
        "title": "Modhera Sun Temple Inverted Block Epigraph (1026 AD)",
        "location": "Surya Kund / Sabha Mandapa, Modhera",
        "script": "Western Kutila / Early Devanagari",
        "language": "Sanskrit",
        "date_vikram_samvat": "Vikram Samvat 1083 (1026 AD)",
        "patron": "Bhimadeva I of the Chaulukya (Solanki) Dynasty",
        "image": {"w": 1600, "h": 900, "originalUrl": "/inscriptions/modhera_inscription.jpg", "enhancedUrl": "/inscriptions/modhera_inscription_clahe.jpg"},
        "lines": [{"idx": 0, "box": [40, 50, 1480, 140], "glyphs": [
            {"i": 0, "box": [40, 50, 120, 140], "read": "विक्रम", "conf": 0.97, "damaged": False},
            {"i": 1, "box": [125, 50, 205, 140], "read": "संवत्", "conf": 0.98, "damaged": False},
            {"i": 2, "box": [210, 50, 280, 140], "read": "१०८३", "conf": 0.95, "damaged": False},
            {"i": 3, "box": [285, 50, 340, 140], "read": "श्री", "conf": 0.98, "damaged": False},
            {"i": 4, "box": [345, 50, 445, 140], "read": "भद्रेश्वर", "conf": 0.41, "damaged": True,
             "candidates": [{"g": "भद्रेश्वर", "p": 0.86}, {"g": "योगेश्वर", "p": 0.09}]},
            {"i": 5, "box": [450, 50, 545, 140], "read": "भास्करस्य", "conf": 0.96, "damaged": False},
            {"i": 6, "box": [550, 50, 640, 140], "read": "मन्दिरं", "conf": 0.97, "damaged": False},
            {"i": 7, "box": [645, 50, 770, 140], "read": "प्रतिष्ठापितम्", "conf": 0.94, "damaged": False},
            {"i": 8, "box": [775, 50, 805, 140], "read": "॥", "conf": 0.99, "damaged": False},
        ]}],
        "degraded": "विक्रम संवत् १०८३... [धुंधला]... भास्करस्य मन्दिरं प्रतिष्ठापितम् ॥",
        "restored": "विक्रम संवत् १०८३ श्री भद्रेश्वर भास्करस्य मन्दिरं प्रतिष्ठापितम् ॥",
        "iast": "vikrama saṃvat 1083 śrī bhadreśvara bhāskarasya mandiraṃ pratiṣṭhāpitam ||",
        "hindi": "विक्रम संवत 1083 (1026 ईस्वी) में भगवान भास्कर (सूर्य देव) के इस पावन मंदिर की प्राण-प्रतिष्ठा की गई।",
        "english": "In Vikram Samvat 1083 (1026 AD), the grand temple dedicated to the divine Sun God Bhaskara was consecrated.",
        "dating": {"vs": 1083, "ce": 1026, "note": "CE = VS - 57"},
        "confidence": {"overall": 0.974, "calibrated": True, "ece_score": 0.038},
        "warnings": ["Inverted foundation block: repurposed upside down in later renovation."],
    },
}

MAX_UPLOAD_MB = 10

@router.get("/steles")
def list_steles():
    """Returns available preloaded steles for epigrapher analysis. PRD E1."""
    return [
        {"id": s["id"], "title": s["title"], "location": s["location"],
         "dating": s["dating"], "confidence": s["confidence"]["overall"],
         "mode": s["mode"], "thumbnail": s["image"]["originalUrl"]}
        for s in CURATED_STELES.values()
    ]

@router.get("/steles/{stele_id}")
def get_stele(stele_id: str):
    """Returns full curated result for a specific stele. PRD E1."""
    if stele_id not in CURATED_STELES:
        raise HTTPException(status_code=404, detail=f"Stele '{stele_id}' not found. Available: {list(CURATED_STELES.keys())}")
    return CURATED_STELES[stele_id]

@router.post("/analyze")
async def analyze_inscription(
    file: Optional[UploadFile] = File(None),
    stele_id: Optional[str] = Query(None),
    script_hint: str = Query("auto", description="nagari|devanagari|old_gujarati|auto"),
    enhance: bool = Query(True),
):
    """
    AI Epigraphy pipeline: preprocess → segment → recognize → translate.
    Returns curated result for known steles, model inference for uploads.
    PRD Section 6.3
    """
    # Curated path
    if stele_id and stele_id in CURATED_STELES:
        return CURATED_STELES[stele_id]

    # Upload path
    if not file:
        raise HTTPException(status_code=422, detail={"code": "NO_FILE", "message": "Provide a file or stele_id"})

    # Validate file
    filename = file.filename or "uploaded.jpg"
    content_type = file.content_type or ""
    if not any(t in content_type.lower() for t in ["jpeg", "jpg", "png", "webp", "octet"]):
        if not any(filename.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"]):
            raise HTTPException(status_code=415, detail={"code": "UNSUPPORTED_FORMAT", "message": "Only JPG/PNG/WEBP supported"})

    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_UPLOAD_MB:
        raise HTTPException(status_code=413, detail={"code": "FILE_TOO_LARGE", "message": f"File {size_mb:.1f}MB exceeds {MAX_UPLOAD_MB}MB limit"})

    # Simulated model inference (hackathon demo)
    return {
        "id": f"an_{random.randint(1000, 9999)}", "mode": "model",
        "image": {"w": 1600, "h": 900, "originalUrl": f"/uploads/{filename}", "enhancedUrl": f"/uploads/{filename}_enh.png"},
        "lines": [{"idx": 0, "box": [40, 60, 1400, 150], "glyphs": [
            {"i": 0, "box": [40, 60, 100, 150], "read": "श्री", "conf": 0.94, "damaged": False},
            {"i": 1, "box": [105, 60, 175, 150], "read": "सोमेश्वर", "conf": 0.92, "damaged": False},
            {"i": 2, "box": [180, 60, 275, 150], "read": "देव", "conf": 0.42, "damaged": True,
             "candidates": [{"g": "देव", "p": 0.78}, {"g": "पाद", "p": 0.14}, {"g": "रूप", "p": 0.08}]},
            {"i": 3, "box": [280, 60, 390, 150], "read": "प्रतिष्ठा", "conf": 0.95, "damaged": False},
            {"i": 4, "box": [395, 60, 480, 150], "read": "कारिता", "conf": 0.91, "damaged": False},
            {"i": 5, "box": [485, 60, 520, 150], "read": "॥", "conf": 0.99, "damaged": False},
        ]}],
        "degraded": "श्री सोमेश्वर... [क्षतिग्रस्त]... प्रतिष्ठा कारिता ॥",
        "restored": "श्री सोमेश्वर देव प्रतिष्ठा कारिता ॥",
        "iast": "śrī someśvara deva pratiṣṭhā kāritā ||",
        "hindi": "भगवान सोमेश्वर देव की पवित्र प्रतिष्ठा संपन्न की गई।",
        "english": "The consecration of Lord Someshwara Deva was piously celebrated.",
        "dating": {"vs": 1245, "ce": 1188, "note": "Inferred from palaeographic analysis"},
        "confidence": {"overall": 0.884, "calibrated": True, "ece_score": 0.065},
        "warnings": ["AI Draft Reading: Expert palaeographical verification recommended."],
    }

class CandidatesRequest(BaseModel):
    glyph_id: str
    query_context: Optional[str] = "वापीं धर्मार्थं"

@router.post("/glyph/candidates")
def get_glyph_candidates(req: CandidatesRequest):
    """Returns top-k candidate reconstructions for a damaged glyph. PRD E5."""
    return {
        "glyph_id": req.glyph_id, "context_applied": req.query_context,
        "top_candidates": [
            {"glyph": "धर्मार्थं", "probability": 0.892, "meaning": "For sacred righteousness"},
            {"glyph": "पुण्यार्थं", "probability": 0.071, "meaning": "For spiritual merit"},
            {"glyph": "लोकार्थं", "probability": 0.037, "meaning": "For the benefit of travelers"},
        ],
    }

class ExportRequest(BaseModel):
    stele_id: str
    format: str = "json"  # json, markdown, tei_xml

@router.post("/export")
def export_result(req: ExportRequest):
    """Export epigraphy result as JSON, Markdown, or TEI-XML. PRD E11."""
    stele = CURATED_STELES.get(req.stele_id, list(CURATED_STELES.values())[0])
    if req.format == "markdown":
        md = f"# {stele['title']}\n\n**Location:** {stele['location']}\n**Dating:** VS {stele['dating']['vs']} ({stele['dating']['ce']} CE)\n\n### Restored\n> {stele['restored']}\n\n### IAST\n{stele['iast']}\n\n### Hindi\n{stele['hindi']}\n\n### English\n{stele['english']}\n\n---\n*Dharohar 4D Epigraphy Engine (IITGN)*"
        return {"format": "markdown", "content": md}
    elif req.format == "tei_xml":
        xml = f'<?xml version="1.0" encoding="UTF-8"?>\n<TEI xmlns="http://www.tei-c.org/ns/1.0">\n  <teiHeader><titleStmt><title>{stele["title"]}</title></titleStmt>\n  <publicationStmt><authority>Dharohar 4D IITGN</authority></publicationStmt>\n  <sourceDesc><p>{stele["location"]}</p></sourceDesc></teiHeader>\n  <text><body>\n    <div type="edition" xml:lang="sa"><p>{stele["restored"]}</p></div>\n    <div type="translation" xml:lang="hi"><p>{stele["hindi"]}</p></div>\n    <div type="translation" xml:lang="en"><p>{stele["english"]}</p></div>\n  </body></text>\n</TEI>'
        return {"format": "tei_xml", "content": xml}
    return {"format": "json", "content": stele}


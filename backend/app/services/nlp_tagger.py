"""
NLP Tagger Service
Rule-based + fuzzy match NLP pipeline for expedition journal processing.
PRD Section 6.5
"""
from __future__ import annotations
import re
from difflib import SequenceMatcher
from typing import Any, Dict, List, Optional

# Gujarat Heritage Gazetteer (~30 places with aliases)
GUJARAT_GAZETTEER = [
    {"name": "Adalaj Ni Vav", "aliases": ["adalaj", "adhalaj", "adalaj stepwell", "adalaj vav", "adalaj ni vav", "અડાલજ"], "lat": 23.1667, "lon": 72.5800, "district": "Gandhinagar"},
    {"name": "Rani Ki Vav", "aliases": ["rani ki vav", "rani vav", "patan stepwell", "રાણકી વાવ", "queen's stepwell"], "lat": 23.8589, "lon": 72.1017, "district": "Patan"},
    {"name": "Modhera Sun Temple", "aliases": ["modhera", "modhera temple", "surya temple modhera", "sun temple", "surya kund", "મોઢેરા"], "lat": 23.5835, "lon": 72.1330, "district": "Mehsana"},
    {"name": "Siddhpur Rudra Mahalaya", "aliases": ["siddhpur", "rudra mahalaya", "rudra mahal", "સિદ્ધપુર"], "lat": 23.9167, "lon": 72.3833, "district": "Patan"},
    {"name": "Siddhpur Bohra Havelis", "aliases": ["bohra haveli", "bohra havelis siddhpur", "dawoodi bohra"], "lat": 23.9167, "lon": 72.3833, "district": "Patan"},
    {"name": "IIT Gandhinagar", "aliases": ["iitgn", "iit gandhinagar", "palaj campus", "iit gn"], "lat": 23.2132, "lon": 72.6841, "district": "Gandhinagar"},
    {"name": "Dholavira", "aliases": ["dholavira", "dholavira ruins", "harappan site", "ધોળાવીરા"], "lat": 23.8870, "lon": 70.2130, "district": "Kutch"},
    {"name": "Lothal", "aliases": ["lothal", "lothal dockyard", "harappan port", "લોથલ"], "lat": 22.5222, "lon": 72.2494, "district": "Ahmedabad"},
    {"name": "Champaner-Pavagadh", "aliases": ["champaner", "pavagadh", "champaner fort", "ચાંપાનેર"], "lat": 22.4858, "lon": 73.5362, "district": "Panchmahal"},
    {"name": "Somnath Temple", "aliases": ["somnath", "somnath mandir", "prabhas patan", "સોમનાથ"], "lat": 20.8880, "lon": 70.4012, "district": "Gir Somnath"},
    {"name": "Dwarka", "aliases": ["dwarka", "dwarkadhish", "dwaraka", "દ્વારકા"], "lat": 22.2394, "lon": 68.9678, "district": "Devbhumi Dwarka"},
    {"name": "Junagadh", "aliases": ["junagadh", "girnar", "uparkot", "જૂનાગઢ"], "lat": 21.5222, "lon": 70.4579, "district": "Junagadh"},
    {"name": "Ahmedabad", "aliases": ["ahmedabad", "amdavad", "old city ahmedabad", "અમદાવાદ"], "lat": 23.0225, "lon": 72.5714, "district": "Ahmedabad"},
    {"name": "Vadnagar", "aliases": ["vadnagar", "anarta", "kirti toran vadnagar", "વડનગર"], "lat": 23.7850, "lon": 72.6370, "district": "Mehsana"},
    {"name": "Gandhinagar", "aliases": ["gandhinagar", "ગાંધીનગર"], "lat": 23.2156, "lon": 72.6369, "district": "Gandhinagar"},
    {"name": "Patan", "aliases": ["patan", "anhilwad patan", "પાટણ"], "lat": 23.8500, "lon": 72.1200, "district": "Patan"},
    {"name": "Sun Temple Modhera", "aliases": ["surya mandir", "sun temple"], "lat": 23.5835, "lon": 72.1330, "district": "Mehsana"},
    {"name": "Sabarmati Ashram", "aliases": ["sabarmati ashram", "gandhi ashram", "sabarmati"], "lat": 23.0607, "lon": 72.5800, "district": "Ahmedabad"},
    {"name": "Sarkhej Roza", "aliases": ["sarkhej", "sarkhej roza", "sarkhej tomb"], "lat": 22.9886, "lon": 72.5018, "district": "Ahmedabad"},
    {"name": "Dada Hari Vav", "aliases": ["dada hari", "dada hari ni vav", "dada hari stepwell"], "lat": 23.0364, "lon": 72.6019, "district": "Ahmedabad"},
]

# Dynasty/Ruler lexicon with aliases
DYNASTY_LEXICON = [
    {"name": "Solanki / Chaulukya", "aliases": ["solanki", "chaulukya", "chalukya", "solankis", "maru-gurjara", "maru gurjara"]},
    {"name": "Vaghela", "aliases": ["vaghela", "vaghelas", "veer singh", "virasingh", "rana veer"]},
    {"name": "Gujarat Sultanate", "aliases": ["sultanate", "mahmud begada", "begada", "muzaffar", "ahmad shah"]},
    {"name": "Bhimadeva I", "aliases": ["bhimadeva", "bhima deva", "bhimdeva", "bhimdev"]},
    {"name": "Queen Udayamati", "aliases": ["udayamati", "udayamti", "udayamatti"]},
    {"name": "Queen Rudabai", "aliases": ["rudabai", "rudadevi", "ruda devi", "ruda bai"]},
    {"name": "Rashtrakuta", "aliases": ["rashtrakuta", "rashtrakutas", "krishna i"]},
    {"name": "Maurya", "aliases": ["maurya", "chandragupta", "ashoka"]},
    {"name": "Mughal", "aliases": ["mughal", "mughal empire", "akbar", "aurangzeb"]},
    {"name": "Maratha", "aliases": ["maratha", "peshwa", "gaekwad"]},
]

# Architecture glossary
ARCHITECTURE_GLOSSARY = [
    "vav", "stepwell", "kund", "torana", "kirti toran", "mandapa", "jali", "shikhara",
    "gopuram", "vimana", "stambha", "amalaka", "kalasha", "garbhagriha", "jagati",
    "cistern", "aquifer", "pavilion", "pillar", "frieze", "niche", "octagonal shaft",
    "tier", "corridor", "sculpture", "bas-relief", "inscription", "carving",
    "dome", "minaret", "arch", "haveli", "baori", "bawdi", "chhatri",
]

# Folklore keyword → tag mapping
FOLKLORE_KEYWORD_MAP = {
    "#HydraulicEngineering": ["water", "cistern", "aquifer", "well", "hydraulic", "reservoir", "kund", "vav", "baori", "tank", "irrigation"],
    "#RoyalMatronage": ["queen", "rani", "rudabai", "udayamati", "patron", "commissioned", "built by", "royal", "matronage"],
    "#StoneIconography": ["carving", "sculpture", "frieze", "bas-relief", "pillar", "ornament", "motif", "apsara", "navagraha"],
    "#AncientEpigraphy": ["inscription", "epigraph", "sanskrit", "devanagari", "stele", "tablet", "engraved"],
    "#SolarArchitecture": ["sun", "solar", "equinox", "solstice", "surya", "light shaft", "sundial"],
    "#ThermalComfort": ["cool", "temperature", "ventilation", "passive cooling", "thermal", "shade"],
    "#SacredGeometry": ["octagonal", "geometry", "symmetry", "axis", "alignment", "cardinal"],
    "#CulturalHeritage": ["heritage", "monument", "archaeological", "conservation", "preservation", "asi", "unesco"],
    "#ExplorerFellowship": ["fellowship", "explorer", "expedition", "field", "survey", "documentation"],
}

def _fuzzy_match(query: str, target: str, threshold: float = 0.65) -> float:
    """Fuzzy string matching using SequenceMatcher."""
    query_lower = query.lower().strip()
    target_lower = target.lower().strip()
    if query_lower in target_lower or target_lower in query_lower:
        return 1.0
    return SequenceMatcher(None, query_lower, target_lower).ratio()

def extract_places(text: str) -> List[Dict[str, Any]]:
    """Extract place references from text using gazetteer + fuzzy matching."""
    text_lower = text.lower()
    words = re.findall(r'\b[\w\'-]+(?:\s+[\w\'-]+){0,3}\b', text_lower)
    found = []
    seen_names = set()

    for place in GUJARAT_GAZETTEER:
        for alias in place["aliases"]:
            if alias in text_lower:
                if place["name"] not in seen_names:
                    found.append({
                        "name": place["name"],
                        "lat": place["lat"],
                        "lon": place["lon"],
                        "conf": 0.95,
                        "match_type": "exact"
                    })
                    seen_names.add(place["name"])
                break
        else:
            # Fuzzy match on multi-word windows
            for word_group in words:
                for alias in place["aliases"]:
                    score = _fuzzy_match(word_group, alias)
                    if score >= 0.75 and place["name"] not in seen_names:
                        found.append({
                            "name": place["name"],
                            "lat": place["lat"],
                            "lon": place["lon"],
                            "conf": round(score * 0.9, 2),
                            "match_type": "fuzzy"
                        })
                        seen_names.add(place["name"])
                        break
    return found

def extract_dynasties(text: str) -> List[str]:
    """Extract dynasty/ruler references from text."""
    text_lower = text.lower()
    found = []
    for dynasty in DYNASTY_LEXICON:
        for alias in dynasty["aliases"]:
            if alias in text_lower:
                if dynasty["name"] not in found:
                    found.append(dynasty["name"])
                break
    return found if found else ["Medieval Western Indian"]

def extract_architecture_terms(text: str) -> List[str]:
    """Extract architecture terms from text."""
    text_lower = text.lower()
    return [term.title() for term in ARCHITECTURE_GLOSSARY if term in text_lower] or ["Subterranean Corridor", "Carved Columns"]

def extract_dates(text: str) -> List[Dict[str, Any]]:
    """Extract dates (CE years, Vikram Samvat) from text."""
    dates = []
    # CE years
    for match in re.finditer(r'\b(1[0-9]{3}|20[0-2][0-9])\s*(?:AD|CE|ad|ce)?\b', text):
        y = int(match.group(1))
        if 500 <= y <= 2026:
            dates.append({"text": f"{y} CE", "ce": y})
    # Vikram Samvat
    for match in re.finditer(r'(?:VS|Samvat|samvat|संवत्?)\s*(\d{3,4})', text):
        vs = int(match.group(1))
        ce = vs - 57
        dates.append({"text": f"VS {vs}", "ce": ce, "vs": vs})
    # Saka era
    for match in re.finditer(r'(?:Saka|शक)\s*(\d{3,4})', text):
        saka = int(match.group(1))
        ce = saka + 78
        dates.append({"text": f"Saka {saka}", "ce": ce, "saka": saka})

    # Deduplicate by CE year
    seen = set()
    unique = []
    for d in dates:
        if d["ce"] not in seen:
            seen.add(d["ce"])
            unique.append(d)
    return unique or [{"text": "undated", "ce": None}]

def extract_tags(text: str) -> List[str]:
    """Extract hashtag-style tags based on keyword matching."""
    text_lower = text.lower()
    tags = []
    for tag, keywords in FOLKLORE_KEYWORD_MAP.items():
        if any(kw in text_lower for kw in keywords):
            tags.append(tag)
    return tags or ["#CulturalHeritage", "#ExplorerFellowship"]

def tag_journal(text: str) -> Dict[str, Any]:
    """Complete NLP extraction pipeline for a journal entry."""
    return {
        "places": extract_places(text),
        "dynasties": extract_dynasties(text),
        "architecture": extract_architecture_terms(text),
        "dates": extract_dates(text),
        "tags": extract_tags(text),
        "word_count": len(text.split()),
    }

def vikram_samvat_to_ce(vs: int) -> int:
    """Convert Vikram Samvat to Common Era. CE = VS - 57 (approx)."""
    return vs - 57

def ce_to_vikram_samvat(ce: int) -> int:
    """Convert Common Era to Vikram Samvat. VS = CE + 57."""
    return ce + 57


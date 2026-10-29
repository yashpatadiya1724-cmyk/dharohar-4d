from fastapi import APIRouter, Header
from typing import Optional
from app.schemas import CoachAskRequest, CoachAskResponse
from app.services.rag_service import search_coach_kb

router = APIRouter(prefix="/coach", tags=["AI Sustainability Coach"])

@router.post("/ask", response_model=CoachAskResponse)
def ask_coach(
    payload: CoachAskRequest,
    accept_language: Optional[str] = Header("en")
):
    lang = payload.lang or accept_language or "en"
    if lang not in ["en", "hi", "gu"]:
        lang = "en"
    return search_coach_kb(payload.question, lang=lang)

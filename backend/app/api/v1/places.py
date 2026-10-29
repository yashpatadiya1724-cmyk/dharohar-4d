from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models import Place

router = APIRouter(prefix="/places", tags=["Locator (E-Waste & Solar)"])

@router.get("")
def list_places(
    place_type: Optional[str] = Query(None, alias="type"),
    db: Session = Depends(get_db)
):
    query = db.query(Place)
    if place_type:
        query = query.filter(Place.type == place_type)
    places = query.all()
    
    return [
        {
            "id": p.id,
            "type": p.type,
            "name": p.name,
            "lat": p.lat,
            "lng": p.lng,
            "address": p.address,
            "hours": p.hours,
            "contact": p.contact
        }
        for p in places
    ]

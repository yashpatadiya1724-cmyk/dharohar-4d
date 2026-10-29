from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import create_access_token, decode_access_token
from app.models import User, Household
from app.schemas import OTPRequest, OTPVerify, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/otp/request")
def request_otp(payload: OTPRequest, db: Session = Depends(get_db)):
    phone = payload.phone.strip()
    if len(phone) < 10:
        raise HTTPException(status_code=400, detail="Invalid 10-digit phone number")
        
    # Check if user exists or create
    user = db.query(User).filter(User.phone == phone).first()
    if not user:
        user = User(phone=phone, name="Eco Citizen")
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return {
        "message": "OTP sent successfully (Demo OTP: 123456)",
        "phone": phone,
        "demo_otp": "123456"
    }

@router.post("/otp/verify", response_model=TokenResponse)
def verify_otp(payload: OTPVerify, db: Session = Depends(get_db)):
    phone = payload.phone.strip()
    otp = payload.otp.strip()
    
    # Demo fixed OTP is 123456 (or accept any 6 digit in demo mode)
    if otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP. Use 123456 for demo.")
        
    user = db.query(User).filter(User.phone == phone).first()
    if not user:
        user = User(phone=phone, name="Eco Citizen")
        db.add(user)
        db.commit()
        db.refresh(user)
        
    # Check if onboarding completed
    household = db.query(Household).filter(Household.user_id == user.id).first()
    onboarding_completed = household is not None
    
    token = create_access_token({"sub": user.id, "phone": user.phone, "role": user.role})
    
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        phone=user.phone,
        name=user.name or "Eco Citizen",
        role=user.role,
        language=user.language,
        onboarding_completed=onboarding_completed
    )

def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        # Fallback to demo user for easy testing
        demo_user = db.query(User).filter(User.phone == "9876543210").first()
        if not demo_user:
            demo_user = User(phone="9876543210", name="Rina Patel", role="user")
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
        return demo_user
        
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
        
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

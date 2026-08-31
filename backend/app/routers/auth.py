from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.farmer import Farmer
from app.models.buyer import Buyer
from app.schemas.farmer import FarmerCreate, FarmerResponse, LoginRequest, TokenResponse
from app.schemas.buyer import BuyerCreate, BuyerResponse
from app.services.auth_service import (
    get_password_hash,
    verify_password,
    create_access_token
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register/farmer", response_model=FarmerResponse, status_code=status.HTTP_201_CREATED)
async def register_farmer(farmer_in: FarmerCreate, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Farmer).where(Farmer.phone == farmer_in.phone))
    existing = res.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered as a farmer"
        )
    
    hashed_pwd = get_password_hash(farmer_in.password)
    db_farmer = Farmer(
        name=farmer_in.name,
        phone=farmer_in.phone,
        password_hash=hashed_pwd,
        village=farmer_in.village,
        district=farmer_in.district,
        state=farmer_in.state,
        latitude=farmer_in.latitude,
        longitude=farmer_in.longitude,
        fpo_name=farmer_in.fpo_name
    )
    db.add(db_farmer)
    await db.commit()
    await db.refresh(db_farmer)
    return db_farmer

@router.post("/register/buyer", response_model=BuyerResponse, status_code=status.HTTP_201_CREATED)
async def register_buyer(buyer_in: BuyerCreate, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Buyer).where(Buyer.phone == buyer_in.phone))
    existing = res.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered as a buyer"
        )
    
    hashed_pwd = get_password_hash(buyer_in.password)
    db_buyer = Buyer(
        name=buyer_in.name,
        phone=buyer_in.phone,
        password_hash=hashed_pwd,
        buyer_type=buyer_in.buyer_type,
        latitude=buyer_in.latitude,
        longitude=buyer_in.longitude
    )
    db.add(db_buyer)
    await db.commit()
    await db.refresh(db_buyer)
    return db_buyer

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest, db: AsyncSession = Depends(get_db)):
    if credentials.role == "farmer":
        res = await db.execute(select(Farmer).where(Farmer.phone == credentials.phone))
        user = res.scalar_one_or_none()
    elif credentials.role == "buyer":
        res = await db.execute(select(Buyer).where(Buyer.phone == credentials.phone))
        user = res.scalar_one_or_none()
    else:
        raise HTTPException(status_code=400, detail="Invalid role specified. Must be 'farmer' or 'buyer'")

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or password"
        )
    
    token_data = {"sub": str(user.id), "role": credentials.role}
    token = create_access_token(data=token_data)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=credentials.role,
        user_id=user.id,
        name=user.name,
        phone=user.phone
    )

from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.farmer import Farmer
from app.schemas.farmer import FarmerResponse
from app.services.auth_service import get_current_farmer

router = APIRouter(prefix="/api/farmers", tags=["Farmers"])

@router.get("/me", response_model=FarmerResponse)
async def get_farmer_me(current_farmer: Farmer = Depends(get_current_farmer)):
    return current_farmer

@router.get("/{farmer_id}", response_model=FarmerResponse)
async def get_farmer_by_id(farmer_id: UUID, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Farmer).where(Farmer.id == farmer_id))
    farmer = res.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return farmer

@router.get("", response_model=List[FarmerResponse])
async def list_farmers(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Farmer))
    return res.scalars().all()

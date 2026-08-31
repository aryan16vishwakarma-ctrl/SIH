from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class FarmerBase(BaseModel):
    name: str
    phone: str
    village: str
    district: str
    state: str
    latitude: float
    longitude: float
    fpo_name: Optional[str] = None

class FarmerCreate(FarmerBase):
    password: str

class FarmerResponse(FarmerBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class LoginRequest(BaseModel):
    phone: str
    password: str
    role: str  # "farmer" or "buyer"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: UUID
    name: str
    phone: str

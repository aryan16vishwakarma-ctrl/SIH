from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.buyer import BuyerType

class BuyerBase(BaseModel):
    name: str
    phone: str
    buyer_type: BuyerType
    latitude: float
    longitude: float

class BuyerCreate(BuyerBase):
    password: str

class BuyerResponse(BuyerBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

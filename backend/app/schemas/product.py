from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.product import ProductCategory

class ProductBase(BaseModel):
    crop_name: str
    category: ProductCategory
    quantity_kg: float
    price_per_kg: float
    harvest_date: str
    description: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    quantity_kg: Optional[float] = None
    price_per_kg: Optional[float] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class ProductFarmerInfo(BaseModel):
    id: UUID
    name: str
    phone: str
    village: str
    district: str
    state: str
    latitude: float
    longitude: float

    model_config = ConfigDict(from_attributes=True)

class ProductResponse(ProductBase):
    id: UUID
    farmer_id: UUID
    fair_price_suggested: Optional[float] = None
    mandi_reference_price: Optional[float] = None
    is_active: bool
    created_at: datetime
    farmer: Optional[ProductFarmerInfo] = None
    distance_km: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

class FairPriceSuggestRequest(BaseModel):
    crop_name: str
    quantity_kg: float
    district: str

class FairPriceSuggestResponse(BaseModel):
    fair_price_min: float
    fair_price_max: float
    mandi_reference_price: float
    fair_farmer_price: Optional[float] = None
    expected_consumer_price: Optional[float] = None
    savings_percent: Optional[float] = None
    savings_message: str

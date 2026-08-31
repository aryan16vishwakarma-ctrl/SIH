from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.order import OrderStatus
from app.schemas.product import ProductResponse
from app.schemas.buyer import BuyerResponse

class OrderCreate(BaseModel):
    product_id: UUID
    quantity_ordered_kg: float

class OrderStatusUpdate(BaseModel):
    status: OrderStatus

class OrderResponse(BaseModel):
    id: UUID
    product_id: UUID
    buyer_id: UUID
    quantity_ordered_kg: float
    total_price: float
    delivery_distance_km: float
    estimated_delivery_days: int
    status: OrderStatus
    created_at: datetime
    product: Optional[ProductResponse] = None
    buyer: Optional[BuyerResponse] = None

    model_config = ConfigDict(from_attributes=True)

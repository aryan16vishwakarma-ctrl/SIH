import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, Float, Integer, DateTime, ForeignKey, Enum as SQLEnum, Uuid
from sqlalchemy.orm import relationship

from app.database import Base

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    FULFILLED = "fulfilled"
    CANCELLED = "cancelled"

class Order(Base):
    __tablename__ = "orders"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(Uuid(as_uuid=True), ForeignKey("products.id"), nullable=False)
    buyer_id = Column(Uuid(as_uuid=True), ForeignKey("buyers.id"), nullable=False)
    quantity_ordered_kg = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    delivery_distance_km = Column(Float, nullable=False)
    estimated_delivery_days = Column(Integer, nullable=False)
    status = Column(SQLEnum(OrderStatus), nullable=False, default=OrderStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    product = relationship("Product", back_populates="orders")
    buyer = relationship("Buyer", back_populates="orders")

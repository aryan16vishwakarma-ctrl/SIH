import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Boolean, ForeignKey, Enum as SQLEnum, Text, Uuid
from sqlalchemy.orm import relationship

from app.database import Base

class ProductCategory(str, enum.Enum):
    VEGETABLES = "vegetables"
    GRAINS = "grains"
    FRUITS = "fruits"
    DAIRY = "dairy"
    PULSES = "pulses"

class Product(Base):
    __tablename__ = "products"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id = Column(Uuid(as_uuid=True), ForeignKey("farmers.id"), nullable=False)
    crop_name = Column(String(255), nullable=False, index=True)
    category = Column(SQLEnum(ProductCategory), nullable=False, index=True)
    quantity_kg = Column(Float, nullable=False)
    price_per_kg = Column(Float, nullable=False)
    fair_price_suggested = Column(Float, nullable=True)
    mandi_reference_price = Column(Float, nullable=True)
    harvest_date = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    farmer = relationship("Farmer", back_populates="products")
    orders = relationship("Order", back_populates="product", cascade="all, delete-orphan")

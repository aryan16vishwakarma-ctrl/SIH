import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Enum as SQLEnum, Uuid
from sqlalchemy.orm import relationship

from app.database import Base

class BuyerType(str, enum.Enum):
    CONSUMER = "consumer"
    BULK_BUYER = "bulk_buyer"

class Buyer(Base):
    __tablename__ = "buyers"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    buyer_type = Column(SQLEnum(BuyerType), nullable=False, default=BuyerType.CONSUMER)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    orders = relationship("Order", back_populates="buyer", cascade="all, delete-orphan")

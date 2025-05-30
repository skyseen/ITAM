from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base

class AssetStatus(str, enum.Enum):
    IN_USE = "in_use"
    AVAILABLE = "available"
    UNDER_MAINTENANCE = "under_maintenance"
    RETIRED = "retired"

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String, unique=True, index=True)  # Custom asset identifier
    type = Column(String)  # e.g., laptop, monitor
    brand = Column(String)
    model = Column(String)
    assigned_user = Column(String, nullable=True)
    department = Column(String)
    purchase_date = Column(DateTime)
    warranty_expiry = Column(DateTime)
    status = Column(Enum(AssetStatus), default=AssetStatus.AVAILABLE)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    issuance_history = relationship("AssetIssuance", back_populates="asset")

class AssetIssuance(Base):
    __tablename__ = "asset_issuance"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"))
    user_name = Column(String)
    department = Column(String)
    issued_date = Column(DateTime, default=datetime.utcnow)
    return_date = Column(DateTime, nullable=True)
    
    # Relationships
    asset = relationship("Asset", back_populates="issuance_history") 
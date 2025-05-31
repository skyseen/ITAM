"""
Core database models for the IT Asset Management System.
This module defines the main database models for assets, users, and departments.
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class AssetStatus(enum.Enum):
    """
    Enumeration of possible asset statuses.
    Used to track the current state of IT assets.
    """
    IN_USE = "in_use"         # Asset is currently assigned to a user
    AVAILABLE = "available"   # Asset is available for assignment
    MAINTENANCE = "maintenance"  # Asset is under maintenance
    RETIRED = "retired"       # Asset is no longer in use

class UserRole(enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    VIEWER = "viewer"

class User(Base):
    """
    User model representing system users.
    Users can be assigned assets and belong to departments.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    department = Column(String(50), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.VIEWER)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    issued_assets = relationship("AssetIssuance", back_populates="user")

class Asset(Base):
    """
    Asset model representing IT equipment and resources.
    Assets can be assigned to users and departments.
    """
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String(50), unique=True, index=True, nullable=False)
    type = Column(String(50), nullable=False)
    brand = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    serial_number = Column(String(100), unique=True)
    department = Column(String(50), nullable=False)
    location = Column(String(100))
    purchase_date = Column(DateTime, nullable=False)
    warranty_expiry = Column(DateTime, nullable=False)
    purchase_cost = Column(String(20))
    condition = Column(String(50), default="Good")
    notes = Column(Text)
    status = Column(SQLEnum(AssetStatus), default=AssetStatus.AVAILABLE)
    assigned_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assigned_user = relationship("User")
    issuances = relationship("AssetIssuance", back_populates="asset")

class AssetIssuance(Base):
    __tablename__ = "asset_issuances"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    issued_date = Column(DateTime, default=datetime.utcnow)
    expected_return_date = Column(DateTime)
    return_date = Column(DateTime, nullable=True)
    notes = Column(Text)
    issued_by = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    asset = relationship("Asset", back_populates="issuances")
    user = relationship("User", back_populates="issued_assets")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), nullable=False)  # warranty_expiry, idle_asset, etc.
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    asset = relationship("Asset")
    user = relationship("User")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False)  # create, update, delete, issue, return
    entity_type = Column(String(50), nullable=False)  # asset, user, issuance
    entity_id = Column(Integer, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User") 
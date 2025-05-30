"""
Core database models for the IT Asset Management System.
This module defines the main database models for assets, users, and departments.
"""

from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Date, Text, Boolean
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin
import enum

class AssetStatus(enum.Enum):
    """
    Enumeration of possible asset statuses.
    Used to track the current state of IT assets.
    """
    IN_USE = "in_use"         # Asset is currently assigned to a user
    AVAILABLE = "available"   # Asset is available for assignment
    MAINTENANCE = "maintenance"  # Asset is under maintenance
    RETIRED = "retired"       # Asset is no longer in use

class User(Base, TimestampMixin):
    """
    User model representing system users.
    Users can be assigned assets and belong to departments.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    # Relationships
    department = relationship("Department", back_populates="users")
    assets = relationship("Asset", back_populates="assigned_to")

class Department(Base, TimestampMixin):
    """
    Department model representing organizational departments.
    Departments can have multiple users and assets.
    """
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)

    # Relationships
    users = relationship("User", back_populates="department")
    assets = relationship("Asset", back_populates="department")

class Asset(Base, TimestampMixin):
    """
    Asset model representing IT equipment and resources.
    Assets can be assigned to users and departments.
    """
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String, unique=True, index=True, nullable=False)  # External asset identifier
    type = Column(String, nullable=False)  # Type of asset (e.g., laptop, monitor)
    brand = Column(String, nullable=False)
    model = Column(String, nullable=False)
    status = Column(Enum(AssetStatus), default=AssetStatus.AVAILABLE)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    purchase_date = Column(Date, nullable=False)
    warranty_expiry = Column(Date, nullable=True)
    notes = Column(Text)

    # Relationships
    assigned_to = relationship("User", back_populates="assets")
    department = relationship("Department", back_populates="assets") 
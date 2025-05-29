from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Date, Text
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin
import enum

class AssetStatus(enum.Enum):
    IN_USE = "in_use"
    AVAILABLE = "available"
    MAINTENANCE = "maintenance"
    RETIRED = "retired"

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    department = relationship("Department", back_populates="users")
    assets = relationship("Asset", back_populates="assigned_to")

class Department(Base, TimestampMixin):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)

    users = relationship("User", back_populates="department")
    assets = relationship("Asset", back_populates="department")

class Asset(Base, TimestampMixin):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String, unique=True, index=True, nullable=False)
    type = Column(String, nullable=False)
    brand = Column(String, nullable=False)
    model = Column(String, nullable=False)
    status = Column(Enum(AssetStatus), default=AssetStatus.AVAILABLE)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    purchase_date = Column(Date, nullable=False)
    warranty_expiry = Column(Date, nullable=True)
    notes = Column(Text)

    assigned_to = relationship("User", back_populates="assets")
    department = relationship("Department", back_populates="assets") 
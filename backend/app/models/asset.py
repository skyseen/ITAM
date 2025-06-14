from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
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
    documents = relationship("AssetDocument", back_populates="asset")

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

class DocumentType(enum.Enum):
    DECLARATION_FORM = "declaration_form"  # P14-Form 2
    IT_ORIENTATION = "it_orientation"      # P14-Form 3  
    HANDOVER_FORM = "handover_form"        # P14-Form 1

class DocumentStatus(enum.Enum):
    PENDING = "pending"
    SIGNED = "signed"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class AssetDocument(Base):
    __tablename__ = "asset_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_type = Column(Enum(DocumentType), nullable=False)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.PENDING)
    
    # Document content and metadata
    document_data = Column(Text)  # JSON data for form fields
    signature_data = Column(Text)  # Base64 encoded signature
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    signed_at = Column(DateTime(timezone=True))
    expires_at = Column(DateTime(timezone=True))
    
    # Relationships
    asset = relationship("Asset", back_populates="documents")
    user = relationship("User", back_populates="signed_documents")

class DocumentTemplate(Base):
    __tablename__ = "document_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    document_type = Column(Enum(DocumentType), unique=True, nullable=False)
    template_name = Column(String(200), nullable=False)
    template_content = Column(Text, nullable=False)  # HTML template
    fields_schema = Column(Text, nullable=False)     # JSON schema for form fields
    is_active = Column(Boolean, default=True)
    version = Column(String(10), default="1.0")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 
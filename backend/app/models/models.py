"""
Core database models for the IT Asset Management System.

This module defines the main database models that represent the core entities
of the system including users, assets, issuances, notifications, and audit logs.

All models inherit from SQLAlchemy's declarative base and include:
- Proper field validation and constraints
- Relationships between entities
- Enums for status and role management
- Timestamp tracking for audit purposes

Author: IT Asset Management System
Created: 2024
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

# Create the declarative base class for all models
Base = declarative_base()


class AssetStatus(enum.Enum):
    """
    Enumeration of possible asset statuses.
    
    This enum defines the lifecycle states an asset can be in:
    - AVAILABLE: Asset is ready for assignment to users
    - PENDING_FOR_SIGNATURE: Asset assigned but waiting for user to sign documents
    - IN_USE: Asset is currently assigned and being used
    - MAINTENANCE: Asset is being repaired or serviced
    - RETIRED: Asset is end-of-life and no longer in service
    """
    AVAILABLE = "available"                # Asset is ready for assignment
    PENDING_FOR_SIGNATURE = "pending_for_signature"  # Asset assigned, awaiting signature
    IN_USE = "in_use"                     # Asset is currently assigned to a user
    MAINTENANCE = "maintenance"           # Asset is under repair or maintenance
    RETIRED = "retired"                   # Asset is end-of-life, no longer usable


class UserRole(enum.Enum):
    """
    Enumeration of user roles in the system.
    
    Defines the access levels and permissions:
    - ADMIN: Full system access, can manage all resources
    - MANAGER: Can manage assets and users in their department
    - VIEWER: Read-only access to assets and basic operations
    """
    ADMIN = "admin"      # Full system administrator privileges
    MANAGER = "manager"  # Department-level management privileges
    VIEWER = "viewer"    # Read-only access with limited operations


class User(Base):
    """
    User model representing system users.
    
    This model stores information about all users who can access the system.
    Users can have different roles (admin, manager, viewer) and are associated
    with departments. They can be assigned assets and perform actions based
    on their role permissions.
    
    Relationships:
    - One-to-many with AssetIssuance (users can have multiple asset assignments)
    """
    __tablename__ = "users"

    # Primary key and unique identifiers
    id = Column(Integer, primary_key=True, index=True, doc="Unique user identifier")
    username = Column(String(50), unique=True, index=True, nullable=False, 
                     doc="Unique username for authentication")
    email = Column(String(100), unique=True, index=True, nullable=False,
                  doc="User's email address, must be unique")
    
    # User profile information
    full_name = Column(String(100), nullable=False, doc="User's full display name")
    department = Column(String(50), nullable=False, doc="Department the user belongs to")
    
    # Access control and authentication
    role = Column(SQLEnum(UserRole), default=UserRole.VIEWER, 
                 doc="User's role determining their system permissions")
    hashed_password = Column(String(255), nullable=False, 
                           doc="Bcrypt hashed password for authentication")
    is_active = Column(Boolean, default=True, 
                      doc="Whether the user account is active and can log in")
    
    # Audit timestamps
    created_at = Column(DateTime, default=datetime.utcnow, 
                       doc="Timestamp when the user account was created")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow,
                       doc="Timestamp when the user account was last modified")

    # Relationships
    issued_assets = relationship("AssetIssuance", back_populates="user",
                               doc="All asset issuances for this user")


class Asset(Base):
    """
    Asset model representing IT equipment and resources.
    
    This is the core model for tracking physical and virtual IT assets.
    Assets have a lifecycle (available -> in_use -> maintenance -> retired)
    and can be assigned to users. The model includes comprehensive metadata
    for asset management including warranty tracking, location, and condition.
    
    Relationships:
    - Many-to-one with User (assets can be assigned to one user)
    - One-to-many with AssetIssuance (assets can have multiple issuance records)
    """
    __tablename__ = "assets"

    # Primary key and asset identification
    id = Column(Integer, primary_key=True, index=True, doc="Unique asset database ID")
    asset_id = Column(String(50), unique=True, index=True, nullable=False,
                     doc="System-generated asset identifier (e.g., LAP-001, RTR-002)")
    asset_tag = Column(String(100), nullable=True, index=True,
                      doc="Finance department assigned asset tag (e.g., FIN-2024-001, COMP-12345)")
    
    # Asset categorization and description
    type = Column(String(50), nullable=False, doc="Asset type (laptop, monitor, etc.)")
    brand = Column(String(100), nullable=False, doc="Manufacturer brand name")
    model = Column(String(100), nullable=False, doc="Specific model designation")
    serial_number = Column(String(100), unique=True, nullable=True,
                          doc="Manufacturer serial number (if available)")
    
    # Organizational information
    department = Column(String(50), nullable=False, 
                       doc="Department responsible for this asset")
    location = Column(String(100), nullable=True,
                     doc="Physical location where asset is stored/used")
    
    # Financial and warranty information
    purchase_date = Column(DateTime, nullable=False, 
                          doc="Date when the asset was purchased")
    warranty_expiry = Column(DateTime, nullable=False,
                           doc="Date when manufacturer warranty expires")
    purchase_cost = Column(String(20), nullable=True,
                          doc="Original purchase cost (stored as string for flexibility)")
    
    # Asset condition and status
    condition = Column(String(50), default="Good",
                      doc="Physical condition (Excellent, Good, Fair, Poor)")
    notes = Column(Text, nullable=True, doc="Additional notes or comments about the asset")
    status = Column(SQLEnum(AssetStatus), default=AssetStatus.AVAILABLE,
                   doc="Current lifecycle status of the asset")
    
    # Operating System information (for servers and computers)
    os = Column(String(100), nullable=True,
                doc="Operating system name (e.g., Windows Server 2019, Ubuntu Server 20.04)")
    os_version = Column(String(50), nullable=True,
                       doc="Operating system version (e.g., 10.0(14393), 5.4.0-74)")
    
    # Assignment tracking
    assigned_user_id = Column(Integer, ForeignKey("users.id"), nullable=True,
                             doc="ID of user currently assigned this asset (if any)")
    
    # Audit timestamps
    created_at = Column(DateTime, default=datetime.utcnow,
                       doc="Timestamp when asset record was created")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow,
                       doc="Timestamp when asset record was last modified")

    # Relationships
    assigned_user = relationship("User", doc="User currently assigned to this asset")
    issuances = relationship("AssetIssuance", back_populates="asset",
                           doc="All issuance records for this asset")


class AssetIssuance(Base):
    """
    Asset issuance model tracking asset assignments to users.
    
    This model maintains a complete history of when assets are issued to
    and returned by users. It supports both active assignments (return_date is None)
    and historical records. This enables full audit trails and reporting
    on asset utilization.
    
    Relationships:
    - Many-to-one with Asset (multiple issuances can exist for one asset)
    - Many-to-one with User (multiple issuances can exist for one user)
    """
    __tablename__ = "asset_issuances"

    # Primary key
    id = Column(Integer, primary_key=True, index=True, doc="Unique issuance record ID")
    
    # Foreign key relationships
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False,
                     doc="ID of the asset being issued")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False,
                    doc="ID of the user receiving the asset")
    
    # Issuance timeline
    issued_date = Column(DateTime, default=datetime.utcnow,
                        doc="Date and time when asset was issued")
    expected_return_date = Column(DateTime, nullable=True,
                                 doc="Expected return date (optional)")
    return_date = Column(DateTime, nullable=True,
                        doc="Actual return date (None if still issued)")
    
    # Additional information
    notes = Column(Text, nullable=True, doc="Notes about this issuance")
    issued_by = Column(String(100), doc="Username of person who issued the asset")
    
    # Audit timestamp
    created_at = Column(DateTime, default=datetime.utcnow,
                       doc="Timestamp when issuance record was created")

    # Relationships
    asset = relationship("Asset", back_populates="issuances",
                        doc="The asset that was issued")
    user = relationship("User", back_populates="issued_assets",
                       doc="The user who received the asset")


class Notification(Base):
    """
    Notification model for system alerts and messages.
    
    This model stores notifications for various system events such as:
    - Warranty expiration warnings
    - Idle asset alerts
    - System maintenance notices
    - User-specific messages
    
    Notifications can be asset-specific, user-specific, or general system alerts.
    """
    __tablename__ = "notifications"

    # Primary key
    id = Column(Integer, primary_key=True, index=True, doc="Unique notification ID")
    
    # Notification classification and content
    type = Column(String(50), nullable=False,
                 doc="Type of notification (warranty_expiry, idle_asset, etc.)")
    title = Column(String(200), nullable=False, doc="Short notification title")
    message = Column(Text, nullable=False, doc="Full notification message")
    
    # Related entities (optional)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=True,
                     doc="Associated asset ID (if asset-related notification)")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True,
                    doc="Target user ID (if user-specific notification)")
    
    # Notification state
    is_read = Column(Boolean, default=False, doc="Whether notification has been read")
    
    # Audit timestamp
    created_at = Column(DateTime, default=datetime.utcnow,
                       doc="Timestamp when notification was created")

    # Relationships
    asset = relationship("Asset", doc="Associated asset (if applicable)")
    user = relationship("User", doc="Target user (if applicable)")


class AuditLog(Base):
    """
    Enhanced audit log model for tracking all system actions and changes.
    
    This model provides a comprehensive audit trail of all significant actions
    performed in the system, including asset management, user actions, and
    administrative operations. Each log entry captures who did what, when,
    and provides context for the action.
    
    Actions tracked include:
    - Asset creation, modification, deletion
    - User management actions  
    - Asset issuances and returns
    - Status changes
    - Document signing
    - Bulk operations
    """
    __tablename__ = "audit_logs"

    # Primary key
    id = Column(Integer, primary_key=True, index=True, doc="Unique audit log entry ID")
    
    # Action classification
    action = Column(String(100), nullable=False,
                   doc="Type of action performed (create, update, delete, assign, status_change, sign_document, etc.)")
    resource_type = Column(String(50), nullable=False,
                          doc="Type of resource affected (asset, user, server, network_appliance, etc.)")
    resource_id = Column(String(50), nullable=True,
                        doc="ID of the affected resource (asset_id, user_id, etc.)")
    resource_name = Column(String(200), nullable=True,
                          doc="Human-readable name of the affected resource")
    
    # Actor information
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False,
                    doc="ID of the user who performed the action")
    user_name = Column(String(100), nullable=False,
                      doc="Name of user at time of action (for historical reference)")
    user_role = Column(String(20), nullable=False,
                      doc="Role of user at time of action")
    
    # Action details and context
    description = Column(Text, nullable=False,
                        doc="Human-readable description of the action")
    details = Column(Text, nullable=True,
                    doc="Additional details or metadata (JSON format)")
    old_values = Column(Text, nullable=True,
                       doc="Previous values before change (JSON format)")
    new_values = Column(Text, nullable=True,
                       doc="New values after change (JSON format)")
    
    # Asset-specific tracking (for asset-related actions)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=True,
                     doc="Related asset database ID (if applicable)")
    asset_identifier = Column(String(50), nullable=True,
                             doc="Asset identifier at time of action (e.g., LAP-001)")
    
    # IP and session tracking
    ip_address = Column(String(45), nullable=True,
                       doc="IP address of user performing action")
    user_agent = Column(String(500), nullable=True,
                       doc="Browser/client user agent")
    
    # Timestamps
    timestamp = Column(DateTime, default=datetime.utcnow,
                      doc="When the action occurred")

    # Relationships
    user = relationship("User", doc="User who performed the action")
    asset = relationship("Asset", doc="Asset related to this action (if applicable)")


class DocumentType(enum.Enum):
    """Document types for electronic signature workflow"""
    DECLARATION_FORM = "declaration_form"  # P14-Form 2
    IT_ORIENTATION = "it_orientation"      # P14-Form 3  
    HANDOVER_FORM = "handover_form"        # P14-Form 1


class DocumentStatus(enum.Enum):
    """Document signing status"""
    PENDING = "pending"
    SIGNED = "signed"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class AssetDocument(Base):
    """
    Asset document model for electronic signature workflow.
    
    This model tracks documents that need to be signed when assets are issued,
    including declaration forms, IT orientation forms, and handover forms.
    """
    __tablename__ = "asset_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_type = Column(SQLEnum(DocumentType), nullable=False)
    status = Column(SQLEnum(DocumentStatus), default=DocumentStatus.PENDING)
    
    # Document content and metadata
    document_data = Column(Text)  # JSON data for form fields
    signature_data = Column(Text)  # Base64 encoded signature
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    signed_at = Column(DateTime)
    expires_at = Column(DateTime)
    
    # Relationships
    asset = relationship("Asset")
    user = relationship("User")


class DocumentTemplate(Base):
    """
    Document template model for electronic signature forms.
    
    This model stores the HTML templates and field schemas for the various
    forms that need to be signed during asset issuance.
    """
    __tablename__ = "document_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    document_type = Column(SQLEnum(DocumentType), unique=True, nullable=False)
    template_name = Column(String(200), nullable=False)
    template_content = Column(Text, nullable=False)  # HTML template
    fields_schema = Column(Text, nullable=False)     # JSON schema for form fields
    is_active = Column(Boolean, default=True)
    version = Column(String(10), default="1.0")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
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
    - IN_USE: Asset is currently assigned and being used
    - MAINTENANCE: Asset is being repaired or serviced
    - RETIRED: Asset is end-of-life and no longer in service
    """
    AVAILABLE = "available"     # Asset is ready for assignment
    IN_USE = "in_use"          # Asset is currently assigned to a user
    MAINTENANCE = "maintenance" # Asset is under repair or maintenance
    RETIRED = "retired"        # Asset is end-of-life, no longer usable


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
                     doc="Human-readable asset identifier (e.g., LAP-001)")
    
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
    Audit log model for tracking all system actions.
    
    This model provides a complete audit trail of all significant actions
    performed in the system. It tracks who did what, when, and provides
    details about the changes made. This is essential for compliance,
    security, and debugging purposes.
    
    Actions tracked include:
    - Asset creation, modification, deletion
    - User management actions
    - Asset issuances and returns
    - Status changes
    """
    __tablename__ = "audit_logs"

    # Primary key
    id = Column(Integer, primary_key=True, index=True, doc="Unique audit log entry ID")
    
    # Action classification
    action = Column(String(100), nullable=False,
                   doc="Type of action performed (create, update, delete, issue, return)")
    entity_type = Column(String(50), nullable=False,
                        doc="Type of entity affected (asset, user, issuance)")
    entity_id = Column(Integer, nullable=False,
                      doc="ID of the specific entity that was affected")
    
    # Actor information
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False,
                    doc="ID of the user who performed the action")
    
    # Action details
    details = Column(Text, doc="Detailed description of what was changed")
    
    # Audit timestamp
    timestamp = Column(DateTime, default=datetime.utcnow,
                      doc="Exact timestamp when the action was performed")

    # Relationships
    user = relationship("User", doc="User who performed the action") 
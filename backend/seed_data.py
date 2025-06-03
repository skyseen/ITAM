#!/usr/bin/env python3
"""
Database seeding script for IT Asset Management System.

This script populates the database with sample data including:
- Users with different roles (admin, manager, viewer)
- Assets of various types and statuses
- Asset issuances and returns
- Notifications and audit logs

Usage:
    python seed_data.py

Make sure to run this from the backend directory and have the database running.
"""

import sys
import os
from datetime import datetime, timedelta
from passlib.context import CryptContext

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.core.database import SessionLocal, create_tables
from app.models.models import (
    User, UserRole, Asset, AssetStatus, AssetIssuance, 
    Notification, AuditLog, Base
)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)

def create_sample_users(db):
    """Create sample users with different roles."""
    print("Creating sample users...")
    
    users_data = [
        {
            "username": "admin",
            "email": "admin@company.com",
            "full_name": "System Administrator",
            "department": "IT",
            "role": UserRole.ADMIN,
            "password": "admin123"  # Will be hashed
        },
        {
            "username": "manager1",
            "email": "manager1@company.com",
            "full_name": "John Manager",
            "department": "IT",
            "role": UserRole.MANAGER,
            "password": "manager123"
        },
        {
            "username": "manager2",
            "email": "manager2@company.com",
            "full_name": "Sarah Wilson",
            "department": "HR",
            "role": UserRole.MANAGER,
            "password": "manager123"
        },
        {
            "username": "user1",
            "email": "user1@company.com",
            "full_name": "Alice Johnson",
            "department": "Engineering",
            "role": UserRole.VIEWER,
            "password": "user123"
        },
        {
            "username": "user2",
            "email": "user2@company.com",
            "full_name": "Bob Smith",
            "department": "Marketing",
            "role": UserRole.VIEWER,
            "password": "user123"
        },
        {
            "username": "user3",
            "email": "user3@company.com",
            "full_name": "Carol Davis",
            "department": "Finance",
            "role": UserRole.VIEWER,
            "password": "user123"
        },
        {
            "username": "user4",
            "email": "user4@company.com",
            "full_name": "David Brown",
            "department": "Engineering",
            "role": UserRole.VIEWER,
            "password": "user123"
        },
        {
            "username": "user5",
            "email": "user5@company.com",
            "full_name": "Eva Martinez",
            "department": "Sales",
            "role": UserRole.VIEWER,
            "password": "user123"
        }
    ]
    
    users = []
    for user_data in users_data:
        password = user_data.pop("password")
        user = User(
            **user_data,
            hashed_password=hash_password(password)
        )
        db.add(user)
        users.append(user)
    
    db.commit()
    print(f"Created {len(users)} users")
    return users

def create_sample_assets(db):
    """Create sample assets of various types."""
    print("Creating sample assets...")
    
    assets_data = [
        # Laptops
        {
            "asset_id": "LAP-001",
            "type": "Laptop",
            "brand": "Dell",
            "model": "XPS 13",
            "serial_number": "DLL001XPS13",
            "department": "Engineering",
            "location": "Office Floor 3",
            "purchase_date": datetime(2023, 1, 15),
            "warranty_expiry": datetime(2026, 1, 15),
            "purchase_cost": "$1,200",
            "condition": "Excellent"
        },
        {
            "asset_id": "LAP-002",
            "type": "Laptop",
            "brand": "MacBook",
            "model": "MacBook Pro 14",
            "serial_number": "MBP002PRO14",
            "department": "Marketing",
            "location": "Office Floor 2",
            "purchase_date": datetime(2023, 3, 20),
            "warranty_expiry": datetime(2026, 3, 20),
            "purchase_cost": "$2,000",
            "condition": "Excellent"
        },
        {
            "asset_id": "LAP-003",
            "type": "Laptop",
            "brand": "Lenovo",
            "model": "ThinkPad X1",
            "serial_number": "LNV003X1",
            "department": "Finance",
            "location": "Office Floor 1",
            "purchase_date": datetime(2022, 11, 10),
            "warranty_expiry": datetime(2025, 11, 10),
            "purchase_cost": "$1,500",
            "condition": "Good"
        },
        
        # Monitors
        {
            "asset_id": "MON-001",
            "type": "Monitor",
            "brand": "Samsung",
            "model": "27 Curved",
            "serial_number": "SAM001C27",
            "department": "Engineering",
            "location": "Office Floor 3",
            "purchase_date": datetime(2023, 2, 1),
            "warranty_expiry": datetime(2026, 2, 1),
            "purchase_cost": "$350",
            "condition": "Excellent"
        },
        {
            "asset_id": "MON-002",
            "type": "Monitor",
            "brand": "LG",
            "model": "UltraWide 34",
            "serial_number": "LG002UW34",
            "department": "Marketing",
            "location": "Office Floor 2",
            "purchase_date": datetime(2023, 4, 15),
            "warranty_expiry": datetime(2026, 4, 15),
            "purchase_cost": "$450",
            "condition": "Excellent"
        },
        
        # Desktops
        {
            "asset_id": "DESK-001",
            "type": "Desktop",
            "brand": "HP",
            "model": "EliteDesk 800",
            "serial_number": "HP001ED800",
            "department": "HR",
            "location": "Office Floor 1",
            "purchase_date": datetime(2022, 8, 20),
            "warranty_expiry": datetime(2025, 8, 20),
            "purchase_cost": "$800",
            "condition": "Good"
        },
        
        # Printers
        {
            "asset_id": "PRT-001",
            "type": "Printer",
            "brand": "Canon",
            "model": "ImageCLASS MF445dw",
            "serial_number": "CAN001MF445",
            "department": "General",
            "location": "Office Floor 2 Common Area",
            "purchase_date": datetime(2023, 1, 5),
            "warranty_expiry": datetime(2025, 1, 5),
            "purchase_cost": "$300",
            "condition": "Good"
        },
        
        # Network Equipment
        {
            "asset_id": "NET-001",
            "type": "Router",
            "brand": "Cisco",
            "model": "ISR 4331",
            "serial_number": "CSC001ISR4331",
            "department": "IT",
            "location": "Server Room",
            "purchase_date": datetime(2022, 6, 1),
            "warranty_expiry": datetime(2025, 6, 1),
            "purchase_cost": "$1,200",
            "condition": "Good"
        },
        
        # Servers
        {
            "asset_id": "SRV-001",
            "type": "Server",
            "brand": "Dell",
            "model": "PowerEdge R740",
            "serial_number": "DLL001R740",
            "department": "IT",
            "location": "Server Room",
            "purchase_date": datetime(2022, 9, 15),
            "warranty_expiry": datetime(2025, 9, 15),
            "purchase_cost": "$3,500",
            "condition": "Excellent"
        },
        
        # Assets with different statuses
        {
            "asset_id": "LAP-004",
            "type": "Laptop",
            "brand": "HP",
            "model": "EliteBook 840",
            "serial_number": "HP004EB840",
            "department": "Sales",
            "location": "Repair Center",
            "purchase_date": datetime(2022, 5, 10),
            "warranty_expiry": datetime(2025, 5, 10),
            "purchase_cost": "$1,100",
            "condition": "Fair",
            "status": AssetStatus.MAINTENANCE,
            "notes": "Screen replacement needed"
        },
        {
            "asset_id": "MON-003",
            "type": "Monitor",
            "brand": "Dell",
            "model": "UltraSharp 24",
            "serial_number": "DLL003US24",
            "department": "Finance",
            "location": "Storage",
            "purchase_date": datetime(2021, 3, 1),
            "warranty_expiry": datetime(2024, 3, 1),
            "purchase_cost": "$200",
            "condition": "Poor",
            "status": AssetStatus.RETIRED,
            "notes": "End of life, replaced with newer model"
        }
    ]
    
    assets = []
    for asset_data in assets_data:
        asset = Asset(**asset_data)
        db.add(asset)
        assets.append(asset)
    
    db.commit()
    print(f"Created {len(assets)} assets")
    return assets

def create_sample_issuances(db, users, assets):
    """Create sample asset issuances."""
    print("Creating sample asset issuances...")
    
    # Issue some assets to users
    issuances_data = [
        {
            "asset": next(a for a in assets if a.asset_id == "LAP-001"),
            "user": next(u for u in users if u.username == "user1"),
            "issued_date": datetime(2023, 6, 1),
            "expected_return_date": None,
            "notes": "Primary work laptop",
            "issued_by": "admin"
        },
        {
            "asset": next(a for a in assets if a.asset_id == "LAP-002"),
            "user": next(u for u in users if u.username == "user2"),
            "issued_date": datetime(2023, 6, 15),
            "expected_return_date": None,
            "notes": "Design work laptop",
            "issued_by": "manager1"
        },
        {
            "asset": next(a for a in assets if a.asset_id == "MON-001"),
            "user": next(u for u in users if u.username == "user1"),
            "issued_date": datetime(2023, 6, 1),
            "expected_return_date": None,
            "notes": "Secondary monitor for development",
            "issued_by": "admin"
        },
        {
            "asset": next(a for a in assets if a.asset_id == "DESK-001"),
            "user": next(u for u in users if u.username == "manager2"),
            "issued_date": datetime(2023, 5, 20),
            "expected_return_date": None,
            "notes": "HR department workstation",
            "issued_by": "admin"
        }
    ]
    
    issuances = []
    for issuance_data in issuances_data:
        asset = issuance_data["asset"]
        user = issuance_data["user"]
        
        issuance = AssetIssuance(
            asset_id=asset.id,
            user_id=user.id,
            issued_date=issuance_data["issued_date"],
            expected_return_date=issuance_data["expected_return_date"],
            notes=issuance_data["notes"],
            issued_by=issuance_data["issued_by"]
        )
        
        # Update asset status and assignment
        asset.status = AssetStatus.IN_USE
        asset.assigned_user_id = user.id
        
        db.add(issuance)
        issuances.append(issuance)
    
    db.commit()
    print(f"Created {len(issuances)} asset issuances")
    return issuances

def create_sample_notifications(db, users, assets):
    """Create sample notifications."""
    print("Creating sample notifications...")
    
    notifications_data = [
        {
            "type": "warranty_expiry",
            "title": "Warranty Expiring Soon",
            "message": "Asset LAP-003 warranty expires in 30 days",
            "asset": next(a for a in assets if a.asset_id == "LAP-003"),
            "user": next(u for u in users if u.role == UserRole.ADMIN)
        },
        {
            "type": "warranty_expiry",
            "title": "Warranty Expiring Soon",
            "message": "Asset MON-003 warranty expires in 15 days",
            "asset": next(a for a in assets if a.asset_id == "MON-003"),
            "user": next(u for u in users if u.role == UserRole.ADMIN)
        },
        {
            "type": "idle_asset",
            "title": "Asset Idle",
            "message": "Asset SRV-001 has been idle for more than 30 days",
            "asset": next(a for a in assets if a.asset_id == "SRV-001"),
            "user": next(u for u in users if u.role == UserRole.ADMIN)
        }
    ]
    
    notifications = []
    for notif_data in notifications_data:
        notification = Notification(
            type=notif_data["type"],
            title=notif_data["title"],
            message=notif_data["message"],
            asset_id=notif_data["asset"].id,
            user_id=notif_data["user"].id
        )
        db.add(notification)
        notifications.append(notification)
    
    db.commit()
    print(f"Created {len(notifications)} notifications")
    return notifications

def create_sample_audit_logs(db, users, assets):
    """Create sample audit logs."""
    print("Creating sample audit logs...")
    
    admin_user = next(u for u in users if u.role == UserRole.ADMIN)
    
    audit_logs_data = [
        {
            "action": "create",
            "entity_type": "asset",
            "entity_id": next(a for a in assets if a.asset_id == "LAP-001").id,
            "user_id": admin_user.id,
            "details": "Created new laptop asset LAP-001",
            "timestamp": datetime(2023, 1, 15, 10, 30)
        },
        {
            "action": "issue",
            "entity_type": "asset",
            "entity_id": next(a for a in assets if a.asset_id == "LAP-001").id,
            "user_id": admin_user.id,
            "details": "Issued laptop LAP-001 to user1",
            "timestamp": datetime(2023, 6, 1, 14, 15)
        },
        {
            "action": "update",
            "entity_type": "asset",
            "entity_id": next(a for a in assets if a.asset_id == "LAP-004").id,
            "user_id": admin_user.id,
            "details": "Updated asset LAP-004 status to maintenance",
            "timestamp": datetime(2023, 7, 10, 9, 45)
        }
    ]
    
    audit_logs = []
    for log_data in audit_logs_data:
        audit_log = AuditLog(**log_data)
        db.add(audit_log)
        audit_logs.append(audit_log)
    
    db.commit()
    print(f"Created {len(audit_logs)} audit logs")
    return audit_logs

def seed_database():
    """Main function to seed the database with sample data."""
    print("Starting database seeding...")
    
    # Create tables if they don't exist
    create_tables()
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(f"Database already contains {existing_users} users. Skipping seeding.")
            print("To reseed, please clear the database first.")
            return
        
        # Create sample data
        users = create_sample_users(db)
        assets = create_sample_assets(db)
        issuances = create_sample_issuances(db, users, assets)
        notifications = create_sample_notifications(db, users, assets)
        audit_logs = create_sample_audit_logs(db, users, assets)
        
        print("\n" + "="*50)
        print("DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("="*50)
        print("\nSample Login Credentials:")
        print("-" * 30)
        print("Admin User:")
        print("  Username: admin")
        print("  Password: admin123")
        print("\nManager User:")
        print("  Username: manager1")
        print("  Password: manager123")
        print("\nRegular User:")
        print("  Username: user1")
        print("  Password: user123")
        print("\nNote: All user passwords are stored encrypted in the database.")
        print("You can now access the application at http://localhost:3000")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database() 
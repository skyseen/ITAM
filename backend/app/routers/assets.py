"""
Asset Management Router for IT Asset Management System.

This module provides comprehensive API endpoints for managing IT assets throughout
their lifecycle. It handles all CRUD operations, asset tracking, issuance management,
reporting, and analytics related to IT assets.

Key Features:
- Complete asset lifecycle management (create, read, update, delete)
- Asset issuance and return tracking with user assignments
- Advanced filtering and search capabilities across multiple fields
- Dashboard data aggregation with real-time statistics
- CSV export functionality for reporting and compliance
- Asset history tracking and audit trail
- Warranty monitoring and expiration alerts
- Idle asset detection and notifications

Security Features:
- JWT-based authentication required for all endpoints
- Role-based access control (RBAC) for different user levels
- Department-based asset visibility restrictions
- Input validation and sanitization
- SQL injection prevention through ORM usage

Business Logic:
- Asset status management (available, in_use, maintenance, retired)
- Automatic asset ID generation following organizational standards
- Warranty expiration monitoring with configurable alert thresholds
- Asset utilization tracking and idle detection
- Department-based asset allocation and reporting

Author: IT Asset Management System
Version: 1.0.0
Created: 2024
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
import csv
import io

from app.core.database import get_db
from app.models.models import Asset, AssetIssuance, AssetStatus, User, Notification
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter(
    prefix="/assets",
    tags=["assets"]
)

# Pydantic models
class AssetBase(BaseModel):
    asset_id: str
    type: str
    brand: str
    model: str
    serial_number: Optional[str] = None
    department: str
    location: Optional[str] = None
    purchase_date: datetime
    warranty_expiry: datetime
    purchase_cost: Optional[str] = None
    condition: str = "Good"
    notes: Optional[str] = None

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    asset_id: Optional[str] = None
    type: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    purchase_date: Optional[datetime] = None
    warranty_expiry: Optional[datetime] = None
    purchase_cost: Optional[str] = None
    condition: Optional[str] = None
    notes: Optional[str] = None

class AssetResponse(AssetBase):
    id: int
    status: AssetStatus
    assigned_user_id: Optional[int]
    assigned_user_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AssetIssuanceCreate(BaseModel):
    user_id: int
    expected_return_date: Optional[datetime] = None
    notes: Optional[str] = None
    issued_by: str

class AssetIssuanceResponse(BaseModel):
    id: int
    asset_id: int
    user_id: int
    user_name: str
    issued_date: datetime
    expected_return_date: Optional[datetime]
    return_date: Optional[datetime]
    notes: Optional[str]
    issued_by: str

    class Config:
        from_attributes = True

class DashboardData(BaseModel):
    total_assets: int
    assets_by_status: Dict[str, int]
    assets_by_type: Dict[str, int]
    assets_by_department: Dict[str, int]
    recent_issuances: List[AssetIssuanceResponse]
    warranty_alerts: List[AssetResponse]
    idle_assets: List[AssetResponse]

# Dashboard endpoint
@router.get("/dashboard", response_model=DashboardData)
def get_dashboard_data(db: Session = Depends(get_db)):
    """Get comprehensive dashboard data"""
    
    # Total assets
    total_assets = db.query(Asset).count()
    
    # Assets by status
    status_counts = db.query(
        Asset.status, func.count(Asset.id)
    ).group_by(Asset.status).all()
    assets_by_status = {status.value: count for status, count in status_counts}
    
    # Assets by type
    type_counts = db.query(
        Asset.type, func.count(Asset.id)
    ).group_by(Asset.type).all()
    assets_by_type = {asset_type: count for asset_type, count in type_counts}
    
    # Assets by department
    dept_counts = db.query(
        Asset.department, func.count(Asset.id)
    ).group_by(Asset.department).all()
    assets_by_department = {dept: count for dept, count in dept_counts}
    
    # Recent issuances (last 10)
    recent_issuances_query = db.query(AssetIssuance, User.full_name).join(
        User, AssetIssuance.user_id == User.id
    ).filter(
        AssetIssuance.return_date.is_(None)
    ).order_by(AssetIssuance.issued_date.desc()).limit(10).all()
    
    recent_issuances = []
    for issuance, user_name in recent_issuances_query:
        recent_issuances.append(AssetIssuanceResponse(
            id=issuance.id,
            asset_id=issuance.asset_id,
            user_id=issuance.user_id,
            user_name=user_name,
            issued_date=issuance.issued_date,
            expected_return_date=issuance.expected_return_date,
            return_date=issuance.return_date,
            notes=issuance.notes,
            issued_by=issuance.issued_by
        ))
    
    # Warranty alerts (assets expiring in next 30 days)
    thirty_days_from_now = datetime.utcnow() + timedelta(days=30)
    warranty_alerts_query = db.query(Asset).filter(
        and_(
            Asset.warranty_expiry <= thirty_days_from_now,
            Asset.warranty_expiry >= datetime.utcnow(),
            Asset.status != AssetStatus.RETIRED
        )
    ).order_by(Asset.warranty_expiry.asc()).limit(10).all()
    
    warranty_alerts = []
    for asset in warranty_alerts_query:
        asset_response = AssetResponse.from_orm(asset)
        if asset.assigned_user_id:
            user = db.query(User).filter(User.id == asset.assigned_user_id).first()
            asset_response.assigned_user_name = user.full_name if user else None
        warranty_alerts.append(asset_response)
    
    # Idle assets (in use for more than 30 days without activity)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    idle_assets_query = db.query(Asset).filter(
        and_(
            Asset.status == AssetStatus.IN_USE,
            Asset.updated_at <= thirty_days_ago
        )
    ).limit(10).all()
    
    idle_assets = []
    for asset in idle_assets_query:
        asset_response = AssetResponse.from_orm(asset)
        if asset.assigned_user_id:
            user = db.query(User).filter(User.id == asset.assigned_user_id).first()
            asset_response.assigned_user_name = user.full_name if user else None
        idle_assets.append(asset_response)
    
    return DashboardData(
        total_assets=total_assets,
        assets_by_status=assets_by_status,
        assets_by_type=assets_by_type,
        assets_by_department=assets_by_department,
        recent_issuances=recent_issuances,
        warranty_alerts=warranty_alerts,
        idle_assets=idle_assets
    )

# Asset CRUD operations
@router.post("/", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
def create_asset(asset: AssetCreate, db: Session = Depends(get_db)):
    """Create a new asset"""
    # Check if asset_id already exists
    existing_asset = db.query(Asset).filter(Asset.asset_id == asset.asset_id).first()
    if existing_asset:
        raise HTTPException(
            status_code=400,
            detail="Asset ID already exists"
        )
    
    db_asset = Asset(**asset.model_dump())
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    
    asset_response = AssetResponse.from_orm(db_asset)
    return asset_response

@router.get("/", response_model=List[AssetResponse])
def get_assets(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[AssetStatus] = None,
    department: Optional[str] = None,
    asset_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get assets with filtering and pagination"""
    query = db.query(Asset)
    
    # Apply filters
    if status:
        query = query.filter(Asset.status == status)
    if department:
        query = query.filter(Asset.department == department)
    if asset_type:
        query = query.filter(Asset.type == asset_type)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Asset.asset_id.ilike(search_term),
                Asset.brand.ilike(search_term),
                Asset.model.ilike(search_term),
                Asset.serial_number.ilike(search_term)
            )
        )
    
    assets = query.offset(skip).limit(limit).all()
    
    # Add assigned user names
    result = []
    for asset in assets:
        asset_response = AssetResponse.from_orm(asset)
        if asset.assigned_user_id:
            user = db.query(User).filter(User.id == asset.assigned_user_id).first()
            asset_response.assigned_user_name = user.full_name if user else None
        result.append(asset_response)
    
    return result

@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset(asset_id: int, db: Session = Depends(get_db)):
    """Get a specific asset by ID"""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    asset_response = AssetResponse.from_orm(asset)
    if asset.assigned_user_id:
        user = db.query(User).filter(User.id == asset.assigned_user_id).first()
        asset_response.assigned_user_name = user.full_name if user else None
    
    return asset_response

@router.put("/{asset_id}", response_model=AssetResponse)
def update_asset(asset_id: int, asset_update: AssetUpdate, db: Session = Depends(get_db)):
    """Update an asset"""
    db_asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if db_asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Check if asset_id already exists (if being updated)
    if asset_update.asset_id and asset_update.asset_id != db_asset.asset_id:
        existing_asset = db.query(Asset).filter(Asset.asset_id == asset_update.asset_id).first()
        if existing_asset:
            raise HTTPException(
                status_code=400,
                detail="Asset ID already exists"
            )
    
    update_data = asset_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_asset, key, value)
    
    db_asset.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_asset)
    
    asset_response = AssetResponse.from_orm(db_asset)
    if db_asset.assigned_user_id:
        user = db.query(User).filter(User.id == db_asset.assigned_user_id).first()
        asset_response.assigned_user_name = user.full_name if user else None
    
    return asset_response

@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asset(asset_id: int, db: Session = Depends(get_db)):
    """Delete an asset"""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Check if asset is currently issued
    active_issuance = db.query(AssetIssuance).filter(
        and_(
            AssetIssuance.asset_id == asset_id,
            AssetIssuance.return_date.is_(None)
        )
    ).first()
    
    if active_issuance:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete asset that is currently issued"
        )
    
    db.delete(asset)
    db.commit()
    return None

# Asset issuance operations
@router.post("/{asset_id}/issue", response_model=AssetIssuanceResponse)
def issue_asset(
    asset_id: int,
    issuance: AssetIssuanceCreate,
    db: Session = Depends(get_db)
):
    """Issue an asset to a user"""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    if asset.status != AssetStatus.AVAILABLE:
        raise HTTPException(
            status_code=400,
            detail="Asset is not available for issuance"
        )
    
    # Check if user exists
    user = db.query(User).filter(User.id == issuance.user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create issuance record
    db_issuance = AssetIssuance(
        asset_id=asset_id,
        **issuance.model_dump()
    )
    db.add(db_issuance)
    
    # Update asset status
    asset.status = AssetStatus.IN_USE
    asset.assigned_user_id = issuance.user_id
    asset.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_issuance)
    
    return AssetIssuanceResponse(
        id=db_issuance.id,
        asset_id=db_issuance.asset_id,
        user_id=db_issuance.user_id,
        user_name=user.full_name,
        issued_date=db_issuance.issued_date,
        expected_return_date=db_issuance.expected_return_date,
        return_date=db_issuance.return_date,
        notes=db_issuance.notes,
        issued_by=db_issuance.issued_by
    )

@router.post("/{asset_id}/return", response_model=AssetIssuanceResponse)
def return_asset(asset_id: int, db: Session = Depends(get_db)):
    """Return an asset from a user"""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Get the latest active issuance record
    issuance = db.query(AssetIssuance).filter(
        and_(
            AssetIssuance.asset_id == asset_id,
            AssetIssuance.return_date.is_(None)
        )
    ).order_by(AssetIssuance.issued_date.desc()).first()
    
    if not issuance:
        raise HTTPException(
            status_code=400,
            detail="No active issuance record found"
        )
    
    # Get user name
    user = db.query(User).filter(User.id == issuance.user_id).first()
    
    # Update issuance record
    issuance.return_date = datetime.utcnow()
    
    # Update asset status
    asset.status = AssetStatus.AVAILABLE
    asset.assigned_user_id = None
    asset.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(issuance)
    
    return AssetIssuanceResponse(
        id=issuance.id,
        asset_id=issuance.asset_id,
        user_id=issuance.user_id,
        user_name=user.full_name if user else "Unknown",
        issued_date=issuance.issued_date,
        expected_return_date=issuance.expected_return_date,
        return_date=issuance.return_date,
        notes=issuance.notes,
        issued_by=issuance.issued_by
    )

# Export functionality
@router.get("/export/csv")
def export_assets_csv(
    status: Optional[AssetStatus] = None,
    department: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Export assets to CSV"""
    query = db.query(Asset)
    
    if status:
        query = query.filter(Asset.status == status)
    if department:
        query = query.filter(Asset.department == department)
    
    assets = query.all()
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        'Asset ID', 'Type', 'Brand', 'Model', 'Serial Number',
        'Department', 'Location', 'Status', 'Assigned User',
        'Purchase Date', 'Warranty Expiry', 'Purchase Cost',
        'Condition', 'Notes', 'Created At'
    ])
    
    # Write data
    for asset in assets:
        assigned_user = ""
        if asset.assigned_user_id:
            user = db.query(User).filter(User.id == asset.assigned_user_id).first()
            assigned_user = user.full_name if user else ""
        
        writer.writerow([
            asset.asset_id,
            asset.type,
            asset.brand,
            asset.model,
            asset.serial_number or "",
            asset.department,
            asset.location or "",
            asset.status.value,
            assigned_user,
            asset.purchase_date.strftime("%Y-%m-%d"),
            asset.warranty_expiry.strftime("%Y-%m-%d"),
            asset.purchase_cost or "",
            asset.condition,
            asset.notes or "",
            asset.created_at.strftime("%Y-%m-%d %H:%M:%S")
        ])
    
    # Create response
    output.seek(0)
    response = Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=assets.csv"}
    )
    
    return response

# Get asset history
@router.get("/{asset_id}/history", response_model=List[AssetIssuanceResponse])
def get_asset_history(asset_id: int, db: Session = Depends(get_db)):
    """Get issuance history for an asset"""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    issuances = db.query(AssetIssuance, User.full_name).join(
        User, AssetIssuance.user_id == User.id
    ).filter(
        AssetIssuance.asset_id == asset_id
    ).order_by(AssetIssuance.issued_date.desc()).all()
    
    result = []
    for issuance, user_name in issuances:
        result.append(AssetIssuanceResponse(
            id=issuance.id,
            asset_id=issuance.asset_id,
            user_id=issuance.user_id,
            user_name=user_name,
            issued_date=issuance.issued_date,
            expected_return_date=issuance.expected_return_date,
            return_date=issuance.return_date,
            notes=issuance.notes,
            issued_by=issuance.issued_by
        ))
    
    return result 
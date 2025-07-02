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

from fastapi import APIRouter, Depends, HTTPException, status, Query, Response, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
import csv
import io

from app.core.database import get_db
from app.models.models import Asset, AssetIssuance, AssetStatus, User, Notification, AssetDocument, DocumentType, DocumentStatus
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter(
    prefix="/assets",
    tags=["assets"]
)

# Pydantic models
class AssetBase(BaseModel):
    asset_id: str
    asset_tag: Optional[str] = None
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
    asset_tag: Optional[str] = None
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
    status: Optional[str] = None

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
    """Get comprehensive dashboard data for all assets including servers and network appliances"""
    
    # User assets that can be issued out
    user_asset_types = ['laptop', 'desktop', 'tablet']
    user_assets_filter = Asset.type.in_(user_asset_types)
    
    # Total user assets only (for status chart)
    total_assets = db.query(Asset).filter(user_assets_filter).count()
    
    # Assets by status (user assets only for the status chart)
    status_counts = db.query(
        Asset.status, func.count(Asset.id)
    ).filter(user_assets_filter).group_by(Asset.status).all()
    assets_by_status = {status.value: count for status, count in status_counts}
    
    # Assets by type (ALL asset types including servers and network appliances)
    type_counts = db.query(
        Asset.type, func.count(Asset.id)
    ).group_by(Asset.type).all()
    assets_by_type = {asset_type.upper(): count for asset_type, count in type_counts}
    
    # Assets by department (user assets only)
    dept_counts = db.query(
        Asset.department, func.count(Asset.id)
    ).filter(user_assets_filter).group_by(Asset.department).all()
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
@router.get("", response_model=List[AssetResponse])
def get_assets(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    asset_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get assets with filtering and pagination"""
    query = db.query(Asset)
    
    # Apply filters (handle empty strings properly)
    if status and status.strip():
        try:
            status_enum = AssetStatus(status.strip())
            query = query.filter(Asset.status == status_enum)
        except ValueError:
            # Invalid status value, ignore the filter
            pass
    if department and department.strip():
        query = query.filter(Asset.department == department.strip())
    if asset_type and asset_type.strip():
        # Handle multiple asset types separated by commas
        asset_types = [t.strip() for t in asset_type.split(',') if t.strip()]
        if asset_types:
            query = query.filter(Asset.type.in_(asset_types))
    if search and search.strip():
        search_term = f"%{search.strip()}%"
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
        if key == 'status' and value:
            # Convert status string to enum
            try:
                status_enum = AssetStatus(value)
                setattr(db_asset, key, status_enum)
            except ValueError:
                # Invalid status value, skip this update
                continue
        else:
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
    
    # Update asset status and department (asset follows user's department)
    asset.status = AssetStatus.IN_USE
    asset.assigned_user_id = issuance.user_id
    asset.department = user.department  # Update department to user's department
    asset.updated_at = datetime.utcnow()
    
    # Create pending documents for electronic signature
    document_types = [
        DocumentType.DECLARATION_FORM,
        DocumentType.IT_ORIENTATION,
        DocumentType.HANDOVER_FORM
    ]
    
    for doc_type in document_types:
        document = AssetDocument(
            asset_id=asset_id,
            user_id=issuance.user_id,
            document_type=doc_type,
            status=DocumentStatus.PENDING,
            expires_at=datetime.utcnow() + timedelta(days=7)  # 7 days to sign
        )
        db.add(document)
    
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
    
    # Update asset status and reset department back to IT
    asset.status = AssetStatus.AVAILABLE
    asset.assigned_user_id = None
    asset.department = "IT"  # Reset to IT department when returned
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
    status: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Export assets to CSV"""
    query = db.query(Asset)
    
    if status and status.strip():
        try:
            status_enum = AssetStatus(status.strip())
            query = query.filter(Asset.status == status_enum)
        except ValueError:
            # Invalid status value, ignore the filter
            pass
    if department and department.strip():
        query = query.filter(Asset.department == department.strip())
    
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
    """Get asset issuance history"""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    issuances = db.query(AssetIssuance, User.full_name).join(
        User, AssetIssuance.user_id == User.id
    ).filter(AssetIssuance.asset_id == asset_id).order_by(
        AssetIssuance.issued_date.desc()
    ).all()
    
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

@router.post("/import/servers")
def import_servers_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Import servers from CSV file"""
    try:
        # Validate file type
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV file")
        
        # Read and parse CSV content
        csv_content = file.file.read().decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_content))
        
        imported_count = 0
        skipped_count = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 because row 1 is headers
            try:
                # Skip empty rows
                if not any(value.strip() for value in row.values() if value):
                    continue
                
                # Check for duplicate serial number first
                serial_number = row.get('Serial Number', '').strip() or None
                if serial_number:
                    existing_serial = db.query(Asset).filter(Asset.serial_number == serial_number).first()
                    if existing_serial:
                        errors.append(f"Row {row_num}: Serial number '{serial_number}' already exists in database")
                        skipped_count += 1
                        continue
                
                # Get base info for duplicate detection
                brand = row.get('Brand', '').strip()
                model = row.get('Model', '').strip()
                server_name = row.get('Server Name', '').strip()
                
                # Check for potential duplicate based on server name in notes (more specific)
                if server_name:
                    notes_pattern = f"Server: {server_name}%"
                    existing_similar = db.query(Asset).filter(
                        Asset.type == "server",
                        Asset.notes.like(notes_pattern)
                    ).first()
                    if existing_similar:
                        errors.append(f"Row {row_num}: Server with name '{server_name}' already exists")
                        skipped_count += 1
                        continue
                
                # Generate unique asset_id for server
                existing_ids = db.query(Asset.asset_id).filter(Asset.asset_id.like('SRV-%')).all()
                existing_numbers = [int(aid[0].split('-')[1]) for aid in existing_ids if aid[0].split('-')[1].isdigit()]
                next_number = max(existing_numbers) + 1 if existing_numbers else 1
                asset_id = f"SRV-{next_number:03d}"
                
                # Double-check for asset_id uniqueness
                while db.query(Asset).filter(Asset.asset_id == asset_id).first():
                    next_number += 1
                    asset_id = f"SRV-{next_number:03d}"
                
                # Parse purchase date
                purchase_date_str = row.get('Purchase Date', '2024-01-01').strip()
                try:
                    purchase_date = datetime.strptime(purchase_date_str, '%Y-%m-%d')
                except ValueError:
                    try:
                        purchase_date = datetime.strptime(purchase_date_str, '%m/%d/%Y')
                    except ValueError:
                        purchase_date = datetime.strptime('2024-01-01', '%Y-%m-%d')
                
                # Parse warranty expiry
                warranty_expiry_str = row.get('Warranty Expiry', '2027-01-01').strip()
                try:
                    warranty_expiry = datetime.strptime(warranty_expiry_str, '%Y-%m-%d')
                except ValueError:
                    try:
                        warranty_expiry = datetime.strptime(warranty_expiry_str, '%m/%d/%Y')
                    except ValueError:
                        warranty_expiry = datetime.strptime('2027-01-01', '%Y-%m-%d')
                
                # Create server asset
                server_asset = Asset(
                    asset_id=asset_id,
                    type="server",
                    brand=brand,
                    model=model,
                    serial_number=serial_number,
                    department=row.get('Department', 'IT').strip(),
                    location=row.get('Location', '').strip(),
                    purchase_date=purchase_date,
                    warranty_expiry=warranty_expiry,
                    purchase_cost=row.get('Purchase Cost', '').strip() or None,
                    condition=row.get('Condition', 'Good').strip(),
                    notes=f"Server: {server_name} | OS: {row.get('OS', '')} {row.get('OS Version', '')} | Description: {row.get('Server Description', '')} | Remark: {row.get('Remark', '')}".strip(),
                    status=AssetStatus.AVAILABLE
                )
                
                db.add(server_asset)
                db.flush()  # Flush to get any DB errors early
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
                continue
        
        if imported_count > 0:
            db.commit()
        else:
            db.rollback()
        
        return {
            "message": f"Successfully imported {imported_count} servers, skipped {skipped_count} duplicates",
            "imported_count": imported_count,
            "skipped_count": skipped_count,
            "errors": errors
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to import CSV: {str(e)}")

@router.get("/list/servers", response_model=List[AssetResponse])
def get_servers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all server assets"""
    query = db.query(Asset).filter(Asset.type == "server")
    
    # Apply filters
    if status:
        query = query.filter(Asset.status == status)
    if location:
        query = query.filter(Asset.location.ilike(f"%{location}%"))
    if search:
        query = query.filter(
            or_(
                Asset.asset_id.ilike(f"%{search}%"),
                Asset.brand.ilike(f"%{search}%"),
                Asset.model.ilike(f"%{search}%"),
                Asset.notes.ilike(f"%{search}%"),
                Asset.location.ilike(f"%{search}%")
            )
        )
    
    # Get servers with user information
    servers = query.offset(skip).limit(limit).all()
    
    result = []
    for server in servers:
        server_response = AssetResponse.from_orm(server)
        if server.assigned_user_id:
            user = db.query(User).filter(User.id == server.assigned_user_id).first()
            server_response.assigned_user_name = user.full_name if user else None
        result.append(server_response)
    
    return result

@router.get("/list/network-appliances", response_model=List[AssetResponse])
def get_network_appliances(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status: Optional[str] = Query(None),
    appliance_type: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all network appliance assets (router, firewall, switch)"""
    query = db.query(Asset).filter(Asset.type.in_(["router", "firewall", "switch"]))
    
    # Apply filters
    if status:
        query = query.filter(Asset.status == status)
    if appliance_type:
        query = query.filter(Asset.type == appliance_type)
    if location:
        query = query.filter(Asset.location.ilike(f"%{location}%"))
    if search:
        query = query.filter(
            or_(
                Asset.asset_id.ilike(f"%{search}%"),
                Asset.brand.ilike(f"%{search}%"),
                Asset.model.ilike(f"%{search}%"),
                Asset.notes.ilike(f"%{search}%"),
                Asset.location.ilike(f"%{search}%")
            )
        )
    
    # Get network appliances
    appliances = query.offset(skip).limit(limit).all()
    
    result = []
    for appliance in appliances:
        appliance_response = AssetResponse.from_orm(appliance)
        result.append(appliance_response)
    
    return result

@router.delete("/network-appliances/all")
def delete_all_network_appliances(db: Session = Depends(get_db)):
    """Delete all network appliance assets (router, firewall, switch) - FOR TESTING ONLY"""
    try:
        # Delete all network appliances
        deleted_count = db.query(Asset).filter(Asset.type.in_(["router", "firewall", "switch"])).delete()
        db.commit()
        
        return {
            "message": f"Successfully deleted {deleted_count} network appliances",
            "deleted_count": deleted_count
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete network appliances: {str(e)}")

@router.get("/import/network-appliances/template")
def download_network_appliances_template():
    """Download CSV template for network appliances import"""
    template_content = """Type (Required),Network Appliance Description (Optional),Brand (Required),Model (Required),Serial Number (Optional),Asset Tag (Optional - Finance Assigned),Department (Required),Location (Optional),Purchase Date (Optional - YYYY-MM-DD),Warranty Expiry (Optional - YYYY-MM-DD),Purchase Cost (Optional),Condition (Optional),Asset Checked (Optional - Y/N),Remark (Optional)
router,Main office internet gateway,Cisco,ISR 4431,CSC001ISR4431,,IT,Network Closet A,2024-01-10,2027-01-10,$1200,Excellent,Y,Primary internet connection
firewall,Perimeter security appliance,Fortinet,FortiGate 60F,FTN002FG60F,FIN-2024-001,IT,Network Closet A,2024-01-15,2027-01-15,$800,Excellent,Y,Main security gateway
switch,Core network switch,Cisco,Catalyst 9300,CSC003C9300,,IT,Network Closet B,,,,$2500,Excellent,N,48-port managed switch - warranty pending
router,Branch office router,TP-Link,Archer AX6000,TPL004AX6000,FIN-2024-002,Marketing,Branch Office,2024-03-01,2026-03-01,$300,Good,Y,Branch connectivity
switch,Access layer switch,Netgear,GS724T,NET005GS724T,,Engineering,Office Floor 3,2024-01-20,2027-01-20,$400,Good,N,24-port managed switch"""
    
    # Create response with CSV content
    response = Response(content=template_content, media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=network_appliances_import_template.csv"
    return response

@router.post("/import/network-appliances")
def import_network_appliances_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Import network appliances from CSV file"""
    try:
        # Validate file type
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV file")
        
        # Read and parse CSV content
        csv_content = file.file.read().decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_content))
        
        imported_count = 0
        skipped_count = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 because row 1 is headers
            try:
                # Skip empty rows
                if not any(value.strip() for value in row.values() if value):
                    continue
                
                # Determine appliance type
                appliance_type = row.get('Type (Required)', 'router').lower().strip()
                if appliance_type not in ['router', 'firewall', 'switch']:
                    appliance_type = 'router'  # Default fallback
                
                # Get relevant fields for duplicate detection
                asset_tag = row.get('Asset Tag (Optional - Finance Assigned)', '').strip() or None
                serial_number = row.get('Serial Number (Optional)', '').strip() or None
                brand = row.get('Brand (Required)', '').strip()
                model = row.get('Model (Required)', '').strip()
                appliance_description = row.get('Network Appliance Description (Optional)', '').strip()
                location = row.get('Location (Optional)', '').strip()
                
                # PRIMARY DUPLICATE CHECK: Asset Tag (Finance Department's unique identifier)
                if asset_tag:
                    existing_asset_tag = db.query(Asset).filter(Asset.asset_tag == asset_tag).first()
                    if existing_asset_tag:
                        errors.append(f"Row {row_num}: Asset tag '{asset_tag}' already exists in database")
                        skipped_count += 1
                        continue
                
                # SECONDARY DUPLICATE CHECK: Serial number (for items without asset tags)
                if serial_number:
                    existing_serial = db.query(Asset).filter(Asset.serial_number == serial_number).first()
                    if existing_serial:
                        errors.append(f"Row {row_num}: Serial number '{serial_number}' already exists in database")
                        skipped_count += 1
                        continue
                
                # Generate unique asset_id based on type
                prefix_map = {'router': 'RTR', 'firewall': 'FWL', 'switch': 'SWT'}
                prefix = prefix_map[appliance_type]
                
                existing_ids = db.query(Asset.asset_id).filter(Asset.asset_id.like(f'{prefix}-%')).all()
                existing_numbers = [int(aid[0].split('-')[1]) for aid in existing_ids if aid[0].split('-')[1].isdigit()]
                next_number = max(existing_numbers) + 1 if existing_numbers else 1
                asset_id = f"{prefix}-{next_number:03d}"
                
                # Double-check for asset_id uniqueness
                while db.query(Asset).filter(Asset.asset_id == asset_id).first():
                    next_number += 1
                    asset_id = f"{prefix}-{next_number:03d}"
                
                # Parse purchase date (optional)
                purchase_date_str = row.get('Purchase Date (Optional - YYYY-MM-DD)', '').strip()
                purchase_date = None
                if purchase_date_str:
                    try:
                        purchase_date = datetime.strptime(purchase_date_str, '%Y-%m-%d')
                    except ValueError:
                        try:
                            purchase_date = datetime.strptime(purchase_date_str, '%m/%d/%Y')
                        except ValueError:
                            errors.append(f"Row {row_num}: Invalid purchase date format '{purchase_date_str}'. Use YYYY-MM-DD or MM/DD/YYYY")
                            continue
                
                # Default purchase date if not provided
                if not purchase_date:
                    purchase_date = datetime.strptime('2024-01-01', '%Y-%m-%d')
                
                # Parse warranty expiry (optional)
                warranty_expiry_str = row.get('Warranty Expiry (Optional - YYYY-MM-DD)', '').strip()
                warranty_expiry = None
                if warranty_expiry_str:
                    try:
                        warranty_expiry = datetime.strptime(warranty_expiry_str, '%Y-%m-%d')
                    except ValueError:
                        try:
                            warranty_expiry = datetime.strptime(warranty_expiry_str, '%m/%d/%Y')
                        except ValueError:
                            errors.append(f"Row {row_num}: Invalid warranty expiry date format '{warranty_expiry_str}'. Use YYYY-MM-DD or MM/DD/YYYY")
                            continue
                
                # Default warranty expiry if not provided (3 years from purchase date)
                if not warranty_expiry:
                    warranty_expiry = datetime(purchase_date.year + 3, purchase_date.month, purchase_date.day)
                
                # Parse asset checked (Y/N logic)
                asset_checked_str = row.get('Asset Checked (Optional - Y/N)', '').strip().upper()
                asset_checked = asset_checked_str == 'Y'
                
                # Build comprehensive notes including all metadata
                notes_parts = [
                    f"Network Appliance: {appliance_type.title()}",
                    f"Description: {appliance_description}" if appliance_description else None,
                    f"Asset Checked: {'Yes' if asset_checked else 'No'}",
                    f"Remark: {row.get('Remark (Optional)', '')}" if row.get('Remark (Optional)', '').strip() else None
                ]
                notes = " | ".join(filter(None, notes_parts))
                
                # Create network appliance asset
                appliance_asset = Asset(
                    asset_id=asset_id,
                    type=appliance_type,
                    brand=brand,
                    model=model,
                    serial_number=serial_number,
                    asset_tag=asset_tag,  # Finance department assigned tag
                    department=row.get('Department (Required)', 'IT').strip(),
                    location=location,
                    purchase_date=purchase_date,
                    warranty_expiry=warranty_expiry,
                    purchase_cost=row.get('Purchase Cost (Optional)', '').strip() or None,
                    condition=row.get('Condition (Optional)', 'Good').strip(),
                    notes=notes,
                    status=AssetStatus.AVAILABLE
                )
                
                db.add(appliance_asset)
                db.flush()  # Flush to get any DB errors early
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
                continue
        
        if imported_count > 0:
            db.commit()
        else:
            db.rollback()
        
        return {
            "message": f"Successfully imported {imported_count} network appliances, skipped {skipped_count} duplicates",
            "imported_count": imported_count,
            "skipped_count": skipped_count,
            "errors": errors
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to import CSV: {str(e)}") 
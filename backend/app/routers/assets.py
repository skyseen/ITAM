from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models.asset import Asset, AssetIssuance, AssetStatus
from pydantic import BaseModel

router = APIRouter(
    prefix="/assets",
    tags=["assets"]
)

# Pydantic models for request/response
class AssetBase(BaseModel):
    asset_id: str
    type: str
    brand: str
    model: str
    department: str
    purchase_date: datetime
    warranty_expiry: datetime

class AssetCreate(AssetBase):
    pass

class AssetResponse(AssetBase):
    id: int
    assigned_user: str | None
    status: AssetStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AssetIssuanceCreate(BaseModel):
    user_name: str
    department: str

class AssetIssuanceResponse(AssetIssuanceCreate):
    id: int
    asset_id: int
    issued_date: datetime
    return_date: datetime | None

    class Config:
        from_attributes = True

# Asset CRUD operations
@router.post("/", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
def create_asset(asset: AssetCreate, db: Session = Depends(get_db)):
    db_asset = Asset(**asset.model_dump())
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

@router.get("/", response_model=List[AssetResponse])
def get_assets(
    skip: int = 0,
    limit: int = 100,
    status: AssetStatus | None = None,
    department: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Asset)
    if status:
        query = query.filter(Asset.status == status)
    if department:
        query = query.filter(Asset.department == department)
    return query.offset(skip).limit(limit).all()

@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.put("/{asset_id}", response_model=AssetResponse)
def update_asset(asset_id: int, asset_update: AssetCreate, db: Session = Depends(get_db)):
    db_asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if db_asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    for key, value in asset_update.model_dump().items():
        setattr(db_asset, key, value)
    
    db.commit()
    db.refresh(db_asset)
    return db_asset

@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    
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
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    if asset.status != AssetStatus.AVAILABLE:
        raise HTTPException(
            status_code=400,
            detail="Asset is not available for issuance"
        )
    
    # Create issuance record
    db_issuance = AssetIssuance(
        asset_id=asset_id,
        **issuance.model_dump()
    )
    db.add(db_issuance)
    
    # Update asset status
    asset.status = AssetStatus.IN_USE
    asset.assigned_user = issuance.user_name
    
    db.commit()
    db.refresh(db_issuance)
    return db_issuance

@router.post("/{asset_id}/return", response_model=AssetIssuanceResponse)
def return_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Get the latest issuance record
    issuance = (
        db.query(AssetIssuance)
        .filter(AssetIssuance.asset_id == asset_id)
        .order_by(AssetIssuance.issued_date.desc())
        .first()
    )
    
    if not issuance or issuance.return_date:
        raise HTTPException(
            status_code=400,
            detail="No active issuance record found"
        )
    
    # Update issuance record
    issuance.return_date = datetime.utcnow()
    
    # Update asset status
    asset.status = AssetStatus.AVAILABLE
    asset.assigned_user = None
    
    db.commit()
    db.refresh(issuance)
    return issuance 
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from passlib.context import CryptContext
from fastapi.security import HTTPBearer

from app.core.database import get_db
from app.models.models import User, UserRole
from pydantic import BaseModel, EmailStr

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Pydantic models
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    department: str
    role: UserRole = UserRole.VIEWER

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    department: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# User CRUD operations
@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    # Check if username already exists
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )
    
    # Check if email already exists
    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )
    
    # Create user with hashed password
    user_data = user.model_dump()
    user_data.pop("password")
    db_user = User(
        **user_data,
        hashed_password=hash_password(user.password)
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserResponse.from_orm(db_user)

@router.get("/", response_model=List[UserResponse])
def get_users(
    skip: int = 0,
    limit: int = 20,
    department: Optional[str] = None,
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get users with filtering and pagination"""
    query = db.query(User)
    
    if department:
        query = query.filter(User.department == department)
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    users = query.offset(skip).limit(limit).all()
    return [UserResponse.from_orm(user) for user in users]

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get a specific user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse.from_orm(user)

@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    """Update a user"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if username already exists (if being updated)
    if user_update.username and user_update.username != db_user.username:
        existing_user = db.query(User).filter(User.username == user_update.username).first()
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Username already exists"
            )
    
    # Check if email already exists (if being updated)
    if user_update.email and user_update.email != db_user.email:
        existing_email = db.query(User).filter(User.email == user_update.email).first()
        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )
    
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_user)
    
    return UserResponse.from_orm(db_user)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete a user (soft delete by setting is_active to False)"""
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Soft delete
    user.is_active = False
    user.updated_at = datetime.utcnow()
    db.commit()
    return None

@router.put("/{user_id}/password")
def update_password(
    user_id: int,
    password_update: PasswordUpdate,
    db: Session = Depends(get_db)
):
    """Update user password"""
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify current password
    if not verify_password(password_update.current_password, user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )
    
    # Update password
    user.hashed_password = hash_password(password_update.new_password)
    user.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Password updated successfully"}

@router.get("/departments/list")
def get_departments(db: Session = Depends(get_db)):
    """Get list of all departments"""
    departments = db.query(User.department).distinct().all()
    return [dept[0] for dept in departments if dept[0]] 
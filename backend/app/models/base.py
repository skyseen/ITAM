"""
Base model module for SQLAlchemy models.
This module provides the base class and common mixins for all database models.
"""

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, DateTime
from datetime import datetime

# Create declarative base class for all models
Base = declarative_base()

class TimestampMixin:
    """
    Mixin class that adds created_at and updated_at timestamp columns to models.
    These fields are automatically managed by SQLAlchemy.
    """
    # Column for tracking when the record was created
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Column for tracking when the record was last updated
    # Automatically updates when the record is modified
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False) 
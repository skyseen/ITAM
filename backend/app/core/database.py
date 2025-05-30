"""
Database configuration module.
This module sets up the SQLAlchemy database connection and session management.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/itams"
)

# Create SQLAlchemy engine
# The engine is the starting point for any SQLAlchemy application
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create session factory
# This will be used to create individual database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    Dependency function that yields database sessions.
    This function is used by FastAPI to get a database session for each request.
    The session is automatically closed after the request is complete.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 
"""
Configuration module for the application.
This module handles all configuration settings using Pydantic.
"""

from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """
    Application settings class.
    All configuration values are defined here and can be overridden by environment variables.
    """
    # Application metadata
    PROJECT_NAME: str = "IT Asset Management System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database configuration
    # Format: postgresql://username:password@host:port/database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/itams"
    
    # JWT Authentication settings
    SECRET_KEY: str = "your-secret-key-here"  # Change in production
    ALGORITHM: str = "HS256"  # JWT signing algorithm
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # Token expiration time
    
    # CORS settings
    # List of allowed origins for CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000"]
    
    class Config:
        """
        Pydantic configuration class.
        Defines how the settings should be loaded and validated.
        """
        case_sensitive = True  # Environment variables are case-sensitive
        env_file = ".env"  # Load settings from .env file

# Create settings instance
settings = Settings() 
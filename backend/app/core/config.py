"""
Configuration module for the application.
This module handles all configuration settings using Pydantic.
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Application settings class.
    All configuration values are defined here and can be overridden by environment variables.
    """
    # Application settings
    APP_NAME: str = "IT Asset Management System"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Database settings
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@postgres:5432/itams"
    )
    
    # JWT settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS settings
    ALLOWED_HOSTS: list = ["*"]
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://frontend:3000",
        "http://127.0.0.1:3000",
    ]
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    # File upload settings
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # Notification settings
    WARRANTY_ALERT_DAYS: int = 30  # Alert X days before warranty expires
    IDLE_ASSET_DAYS: int = 30      # Flag assets idle for X days
    
    class Config:
        """
        Pydantic configuration class.
        Defines how the settings should be loaded and validated.
        """
        env_file = ".env"  # Load settings from .env file
        case_sensitive = True  # Environment variables are case-sensitive

# Create settings instance
settings = Settings() 
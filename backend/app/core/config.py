"""
Configuration module for the IT Asset Management System.

This module handles all application configuration settings using Pydantic for
type validation and environment variable loading. It provides a centralized
location for managing all configuration parameters across different deployment
environments (development, staging, production).

Key Features:
- Environment variable loading with defaults
- Type validation and conversion
- Centralized configuration management
- Support for different deployment environments
- Security-focused settings for JWT and database

Author: IT Asset Management System
Created: 2024
"""

import os
from typing import Optional, List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Application settings class using Pydantic BaseSettings.
    
    This class defines all configuration values that can be overridden by
    environment variables. It provides type validation and default values
    for all settings, making the application configurable across different
    deployment environments.
    
    Environment variables are automatically loaded and override default values.
    For example, setting DATABASE_URL environment variable will override the
    default database URL.
    """
    
    # ================================
    # APPLICATION SETTINGS
    # ================================
    
    APP_NAME: str = "IT Asset Management System"
    """The display name of the application used in API documentation and responses."""
    
    VERSION: str = "1.0.0"
    """Current version of the application, used in API documentation."""
    
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    """
    Enable debug mode for development.
    In debug mode:
    - More detailed error messages are returned
    - Database queries may be logged
    - Additional development features are enabled
    
    Set DEBUG=true in environment variables to enable.
    """
    
    # ================================
    # DATABASE SETTINGS
    # ================================
    
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@postgres:5432/itams"
    )
    """
    Complete database connection URL.
    
    Format: postgresql://username:password@host:port/database_name
    
    Default is configured for Docker Compose setup with:
    - Username: postgres
    - Password: postgres
    - Host: postgres (Docker service name)
    - Port: 5432 (PostgreSQL default)
    - Database: itams
    
    For production, override with secure credentials:
    DATABASE_URL=postgresql://prod_user:secure_pass@db.example.com:5432/itams_prod
    """
    
    # ================================
    # JWT AUTHENTICATION SETTINGS
    # ================================
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    """
    Secret key for JWT token signing and encryption.
    
    CRITICAL SECURITY SETTING:
    - Must be a strong, random string in production
    - Should be at least 32 characters long
    - Must be kept secret and not committed to version control
    - If compromised, all JWT tokens become invalid
    
    Generate a secure key:
    python -c "import secrets; print(secrets.token_urlsafe(32))"
    """
    
    ALGORITHM: str = "HS256"
    """
    JWT signing algorithm.
    
    HS256 (HMAC with SHA-256) is used for symmetric signing.
    This is secure and efficient for most use cases.
    Alternative: RS256 for asymmetric signing with public/private keys.
    """
    
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    """
    JWT access token expiration time in minutes.
    
    Balance between security and user experience:
    - Shorter time (15-30 min): More secure, users need to login more often
    - Longer time (2-8 hours): Less secure, better user experience
    
    30 minutes is a good default for enterprise applications.
    """
    
    # ================================
    # CORS (Cross-Origin Resource Sharing) SETTINGS
    # ================================
    
    ALLOWED_HOSTS: List[str] = ["*"]
    """
    List of allowed hosts for the API.
    
    In production, restrict to specific domains:
    ALLOWED_HOSTS = ["yourdomain.com", "api.yourdomain.com"]
    
    "*" allows all hosts (acceptable for development only).
    """
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",      # Local React development server
        "http://frontend:3000",       # Docker frontend service
        "http://127.0.0.1:3000",     # Alternative localhost format
    ]
    """
    List of allowed origins for CORS requests.
    
    These URLs can make cross-origin requests to the API:
    - http://localhost:3000: Local development frontend
    - http://frontend:3000: Docker Compose frontend service
    - http://127.0.0.1:3000: Alternative localhost format
    
    In production, add your domain:
    CORS_ORIGINS = ["https://yourdomain.com", "https://app.yourdomain.com"]
    """
    
    # ================================
    # PAGINATION SETTINGS
    # ================================
    
    DEFAULT_PAGE_SIZE: int = 20
    """
    Default number of items returned per page in paginated endpoints.
    
    This balances performance and usability:
    - Smaller (10-20): Faster loading, more network requests
    - Larger (50-100): Slower loading, fewer network requests
    
    20 is optimal for most list views.
    """
    
    MAX_PAGE_SIZE: int = 100
    """
    Maximum number of items that can be requested per page.
    
    Prevents clients from requesting too many items at once, which could:
    - Overload the database
    - Consume excessive memory
    - Cause slow response times
    
    100 is a reasonable upper limit for most use cases.
    """
    
    # ================================
    # FILE UPLOAD SETTINGS
    # ================================
    
    UPLOAD_DIR: str = "uploads"
    """
    Directory for storing uploaded files (relative to application root).
    
    Used for:
    - Asset photos/documentation
    - User profile pictures
    - Import/export files
    
    In production, consider using cloud storage (AWS S3, etc.) instead.
    """
    
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    """
    Maximum file size for uploads in bytes.
    
    10MB (10 * 1024 * 1024 bytes) is reasonable for:
    - Document uploads (PDFs, Word docs)
    - Asset photos
    - Small data files
    
    Adjust based on your needs and infrastructure capacity.
    """
    
    # ================================
    # NOTIFICATION & ALERT SETTINGS
    # ================================
    
    WARRANTY_ALERT_DAYS: int = 30
    """
    Number of days before warranty expiry to trigger alerts.
    
    30 days provides sufficient time for:
    - Planning warranty renewals
    - Budgeting for replacements
    - Coordinating with vendors
    
    Adjust based on your organization's procurement cycle.
    """
    
    IDLE_ASSET_DAYS: int = 30
    """
    Number of days without activity before flagging assets as idle.
    
    Assets not updated for this period are considered potentially:
    - Unused and available for reallocation
    - Lost or misplaced
    - In need of status verification
    
    30 days balances sensitivity with avoiding false positives.
    """
    
    class Config:
        """
        Pydantic configuration class for settings behavior.
        
        This class configures how Pydantic handles the settings:
        - env_file: Load variables from .env file
        - case_sensitive: Environment variable names must match exactly
        """
        
        env_file = ".env"
        """
        Load environment variables from .env file.
        
        Create a .env file in the project root with:
        DATABASE_URL=postgresql://user:pass@host:5432/db
        SECRET_KEY=your-secret-key
        DEBUG=true
        
        This file should be added to .gitignore for security.
        """
        
        case_sensitive = True
        """
        Environment variables are case-sensitive.
        
        This means DATABASE_URL works, but database_url does not.
        Consistent with standard environment variable conventions.
        """

# ================================
# GLOBAL SETTINGS INSTANCE
# ================================

# Create a global settings instance that can be imported throughout the application
settings = Settings()
"""
Global settings instance for the application.

This instance is created once when the module is imported and can be used
throughout the application. It automatically loads values from environment
variables and the .env file.

Usage:
    from app.core.config import settings
    
    # Access configuration values
    print(settings.APP_NAME)
    print(settings.DATABASE_URL)
    
    # In FastAPI dependencies
    def get_db_url():
        return settings.DATABASE_URL
""" 
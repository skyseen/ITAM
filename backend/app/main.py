"""
Main FastAPI application module.
This module sets up the FastAPI application with all necessary configurations,
middleware, and routes.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.database import engine
from app.models import asset
from app.routers import assets

# Create database tables
asset.Base.metadata.create_all(bind=engine)

# Create FastAPI application instance with metadata
app = FastAPI(
    title="IT Asset Management System",
    description="API for managing IT assets, their issuance, and tracking",
    version="1.0.0"
)

# Configure CORS middleware
# This allows the frontend to make requests to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend URL
    allow_credentials=True,  # Allow cookies in cross-origin requests
    allow_methods=["*"],     # Allow all HTTP methods
    allow_headers=["*"],     # Allow all headers
)

# Include routers
app.include_router(assets.router)

@app.get("/")
async def root():
    """
    Root endpoint that returns a welcome message.
    This is the entry point of the API.
    """
    return {
        "message": "Welcome to IT Asset Management System API",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    Used to verify if the API is running and operational.
    """
    return JSONResponse(
        content={
            "status": "healthy",
            "version": "1.0.0"
        }
    ) 
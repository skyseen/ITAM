"""
Main FastAPI application module.
This module sets up the FastAPI application with all necessary configurations,
middleware, and routes.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import create_tables
from app.routers import assets, users, auth, documents


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_tables()
    yield
    # Shutdown
    pass

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="A comprehensive IT Asset Management System for tracking and managing IT equipment",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(assets.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.VERSION,
        "docs": "/docs",
        "api": "/api/v1"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
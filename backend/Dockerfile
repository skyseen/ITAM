# Use Python 3.11 slim image as base
FROM python:3.11-slim

# Set working directory in container
WORKDIR /app

# Install system dependencies
# build-essential: Required for compiling some Python packages
# libpq-dev: Required for PostgreSQL adapter
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port for FastAPI
EXPOSE 8000

# Command to run the application
# Using uvicorn with host 0.0.0.0 to allow external connections
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 
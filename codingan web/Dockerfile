# Multi-stage build for backend (Python) and frontend (Node/React)

# --- Backend Stage ---
FROM python:3.11-slim AS backend

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY backend/requirements.txt ./backend/requirements.txt

# Install Python dependencies (includes AI dependencies now)
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy AI module and Backend code
COPY ai/ ./ai/
COPY backend/ ./backend/

WORKDIR /app/backend

# --- Frontend Stage ---
FROM node:20-alpine AS frontend

WORKDIR /app/frontend

# Copy package files first for better caching
COPY frontend/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy rest of frontend code
COPY frontend/ ./

# Expose Vite dev server port
EXPOSE 5173

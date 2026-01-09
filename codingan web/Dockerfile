# Multi-stage build for backend (Python) and frontend (Vite/React)

# --- Backend Stage ---
FROM python:3.11-slim AS backend

# Install Node.js for Nodemon (Hot Reloading)
RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*
RUN npm install -g nodemon

WORKDIR /app

# Install Python dependencies for backend and AI
RUN pip install --no-cache-dir websockets 

# Copy AI module and Backend
# Note: dataset is excluded via .dockerignore
COPY ai/ ./ai/
COPY backend/ ./backend/

WORKDIR /app/backend

# --- Frontend Stage ---
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# --- Final Stage ---
FROM python:3.11-slim
WORKDIR /app
# Copy backend
COPY --from=backend /app/backend ./backend
# Copy frontend build
COPY --from=frontend /app/frontend/dist ./frontend/dist
# Install backend dependencies
RUN pip install --no-cache-dir websockets
# Expose backend port
EXPOSE 8080
# Expose frontend port (for static file serving if needed)
EXPOSE 5173
# Start backend server
CMD ["python", "backend/server.py"]

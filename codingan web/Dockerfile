# Multi-stage build for backend (Python) and frontend (Vite/React)

# --- Backend Stage ---
FROM python:3.11-slim AS backend
WORKDIR /app/backend
COPY backend/ ./
RUN pip install --no-cache-dir websockets

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

"""
FastAPI Application Entry Point

Unified server yang menyediakan:
- REST API endpoints untuk authentication, patients, sessions, games
- WebSocket endpoint untuk real-time data streaming
- Firebase integration untuk sensor data
- AI prediction untuk ECG analysis

Note: Ini adalah satu-satunya server yang dibutuhkan untuk production & development.
Standalone WebSocket server telah dihapus untuk mengurangi duplikasi dan kompleksitas.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.config import settings
from app.database import init_db
from app.api.routes import auth, patients, sessions, games
from app.api.websocket import router as ws_router

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API untuk NeuroRehab Glove AI System",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, change to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["Sessions"])
app.include_router(games.router, prefix="/api/games", tags=["Games"])
app.include_router(ws_router, tags=["WebSocket"])


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    try:
        init_db()
        print(f"[Server] {settings.APP_NAME} v{settings.APP_VERSION} started")
        print(f"[Server] Database: {settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}")
    except Exception as e:
        print(f"[Server] Database init failed: {e}")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )

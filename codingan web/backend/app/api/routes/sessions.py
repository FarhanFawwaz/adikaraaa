"""
Therapy Sessions Routes
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User

router = APIRouter()


class SessionData(BaseModel):
    """Session data model"""
    id: str
    patient_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_minutes: int
    games_played: List[str]
    avg_bpm: float
    avg_spo2: float
    flex_score: float
    ai_alerts: int
    status: str  # ongoing, completed, interrupted


class SessionCreate(BaseModel):
    """Create session model"""
    patient_id: str
    games_played: List[str] = []


# Mock data
mock_sessions = [
    SessionData(
        id="S-001",
        patient_id="P-2025-001",
        start_time=datetime(2025, 1, 10, 9, 0),
        end_time=datetime(2025, 1, 10, 9, 30),
        duration_minutes=30,
        games_played=["piano", "catch"],
        avg_bpm=72.5,
        avg_spo2=98.2,
        flex_score=75.0,
        ai_alerts=0,
        status="completed"
    )
]


COOKIE_NAME = "access_token"


async def get_current_user_from_request(request: Request, db: Session) -> Optional[User]:
    """Extract user from cookie or Authorization header"""
    from app.utils.auth import decode_access_token
    
    # Try cookie first
    token = request.cookies.get(COOKIE_NAME)
    
    # Try Authorization header if no cookie
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")
    
    if not token:
        return None
    
    payload = decode_access_token(token)
    if not payload:
        return None
    
    user_id = payload.get("sub")
    if not user_id:
        return None
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    return user


async def get_current_user_from_cookie(request: Request, db: Session) -> Optional[User]:
    """Extract user from httpOnly cookie - deprecated, use get_current_user_from_request"""
    return await get_current_user_from_request(request, db)


@router.get("/count")
async def get_session_count(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get session count for current user"""
    
    user = await get_current_user_from_request(request, db)
    
    if not user:
        # Return 0 if not authenticated (for graceful degradation)
        return {"count": 0}
    
    # For now, return count from mock data
    # TODO: Implement actual session counting from database
    patient_id = f"P-{datetime.now().year}-{str(user.id).zfill(3)}"
    count = len([s for s in mock_sessions if s.patient_id == patient_id])
    
    return {"count": count}


@router.get("/", response_model=List[SessionData])
async def get_sessions():
    """Get all sessions"""
    return mock_sessions


@router.get("/patient/{patient_id}", response_model=List[SessionData])
async def get_patient_sessions(patient_id: str):
    """Get sessions by patient ID"""
    return [s for s in mock_sessions if s.patient_id == patient_id]


@router.get("/{session_id}", response_model=SessionData)
async def get_session(session_id: str):
    """Get session by ID"""
    for session in mock_sessions:
        if session.id == session_id:
            return session
    raise HTTPException(status_code=404, detail="Session not found")


@router.post("/start", response_model=SessionData)
async def start_session(data: SessionCreate):
    """Start new therapy session"""
    new_session = SessionData(
        id=f"S-{len(mock_sessions) + 1:03d}",
        patient_id=data.patient_id,
        start_time=datetime.now(),
        duration_minutes=0,
        games_played=data.games_played,
        avg_bpm=0,
        avg_spo2=0,
        flex_score=0,
        ai_alerts=0,
        status="ongoing"
    )
    mock_sessions.append(new_session)
    return new_session


@router.post("/{session_id}/end", response_model=SessionData)
async def end_session(session_id: str):
    """End ongoing session"""
    for i, session in enumerate(mock_sessions):
        if session.id == session_id:
            session.end_time = datetime.now()
            session.status = "completed"
            session.duration_minutes = int(
                (session.end_time - session.start_time).total_seconds() / 60
            )
            return session
    raise HTTPException(status_code=404, detail="Session not found")

"""
Therapy Sessions Routes
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

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

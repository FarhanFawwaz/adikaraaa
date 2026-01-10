"""
Game Data Routes
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


class GameInfo(BaseModel):
    """Game information model"""
    id: str
    name: str
    description: str
    category: str
    difficulty: str
    duration_minutes: int
    target_muscles: List[str]
    icon: str


class GameScore(BaseModel):
    """Game score model"""
    id: str
    game_id: str
    patient_id: str
    session_id: str
    score: int
    accuracy: float
    duration_seconds: int
    timestamp: str


# Mock games data
games = [
    GameInfo(
        id="piano",
        name="Finger Piano",
        description="Mainkan melodi dengan gerakan jari. Melatih koordinasi jari individual.",
        category="Motorik Halus",
        difficulty="Pemula - Mahir",
        duration_minutes=7,
        target_muscles=["jari", "telapak tangan"],
        icon="fa-music"
    ),
    GameInfo(
        id="catch",
        name="Fruit Catch",
        description="Tangkap buah jatuh dengan menggenggam tangan.",
        category="Grip Strength",
        difficulty="Mudah - Sedang",
        duration_minutes=8,
        target_muscles=["genggaman", "pergelangan"],
        icon="fa-apple-alt"
    ),
    GameInfo(
        id="memory",
        name="Memory Pattern",
        description="Ikuti urutan gerakan jari. Melatih memori kerja.",
        category="Kognitif + Motorik",
        difficulty="Sedang - Sulit",
        duration_minutes=8,
        target_muscles=["jari", "koordinasi"],
        icon="fa-brain"
    ),
    GameInfo(
        id="garden",
        name="Gardening Simulator",
        description="Tanam dan rawat taman virtual dengan gerakan tangan.",
        category="Long-term Engagement",
        difficulty="Semua Level",
        duration_minutes=15,
        target_muscles=["seluruh tangan"],
        icon="fa-seedling"
    )
]


@router.get("/", response_model=List[GameInfo])
async def get_games():
    """Get all available games"""
    return games


@router.get("/{game_id}", response_model=GameInfo)
async def get_game(game_id: str):
    """Get game by ID"""
    for game in games:
        if game.id == game_id:
            return game
    raise HTTPException(status_code=404, detail="Game not found")


@router.get("/scores/{patient_id}", response_model=List[GameScore])
async def get_patient_scores(patient_id: str):
    """Get game scores for a patient"""
    # TODO: Implement database query
    return []


@router.post("/scores", response_model=GameScore)
async def save_score(score: GameScore):
    """Save game score"""
    # TODO: Implement database save
    return score

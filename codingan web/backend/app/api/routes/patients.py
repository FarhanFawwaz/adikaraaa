"""
Patient Management Routes
"""
from fastapi import APIRouter, HTTPException, Depends, Request, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.patient_profile import PatientProfile
from app.models.user import User
from app.utils.auth import decode_access_token

router = APIRouter()


# ============================================
# Pydantic Models
# ============================================

class Patient(BaseModel):
    """Patient model"""
    id: str
    name: str
    age: int
    gender: str
    diagnosis: str
    stroke_date: Optional[date] = None
    therapist_id: Optional[str] = None
    notes: Optional[str] = None


class PatientCreate(BaseModel):
    """Create patient model"""
    name: str
    age: int
    gender: str
    diagnosis: str
    stroke_date: Optional[date] = None
    notes: Optional[str] = None


class PatientHealthProfile(BaseModel):
    """Patient health profile after registration"""
    age: int
    has_hypertension: bool = False
    has_diabetes: bool = False
    has_heart_disease: bool = False
    has_no_conditions: bool = False
    notes: Optional[str] = None


class PatientHealthProfileResponse(BaseModel):
    """Response for patient health profile"""
    success: bool
    message: str
    profile: Optional[dict] = None


# ============================================
# Helper Functions
# ============================================

COOKIE_NAME = "access_token"

async def get_current_user_from_cookie(request: Request, db: Session) -> Optional[User]:
    """Extract user from httpOnly cookie"""
    token = request.cookies.get(COOKIE_NAME)
    
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


# ============================================
# Health Profile Routes
# ============================================

@router.post("/profile/health", response_model=PatientHealthProfileResponse)
async def save_health_profile(
    data: PatientHealthProfile,
    request: Request,
    db: Session = Depends(get_db)
):
    """Save patient health profile after registration"""
    
    # Get current user from cookie
    user = await get_current_user_from_cookie(request, db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tidak terautentikasi"
        )
    
    # Check if profile already exists
    existing_profile = db.query(PatientProfile).filter(
        PatientProfile.user_id == user.id
    ).first()
    
    if existing_profile:
        # Update existing profile
        existing_profile.age = data.age
        existing_profile.has_hypertension = data.has_hypertension
        existing_profile.has_diabetes = data.has_diabetes
        existing_profile.has_heart_disease = data.has_heart_disease
        existing_profile.has_no_conditions = data.has_no_conditions
        existing_profile.notes = data.notes
        db.commit()
        db.refresh(existing_profile)
        profile = existing_profile
    else:
        # Create new profile
        profile = PatientProfile(
            user_id=user.id,
            age=data.age,
            has_hypertension=data.has_hypertension,
            has_diabetes=data.has_diabetes,
            has_heart_disease=data.has_heart_disease,
            has_no_conditions=data.has_no_conditions,
            notes=data.notes
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    return PatientHealthProfileResponse(
        success=True,
        message="Profil kesehatan berhasil disimpan",
        profile={
            "id": profile.id,
            "age": profile.age,
            "has_hypertension": profile.has_hypertension,
            "has_diabetes": profile.has_diabetes,
            "has_heart_disease": profile.has_heart_disease,
            "has_no_conditions": profile.has_no_conditions
        }
    )


@router.get("/profile/health", response_model=PatientHealthProfileResponse)
async def get_health_profile(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get patient health profile"""
    
    user = await get_current_user_from_cookie(request, db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tidak terautentikasi"
        )
    
    profile = db.query(PatientProfile).filter(
        PatientProfile.user_id == user.id
    ).first()
    
    if not profile:
        return PatientHealthProfileResponse(
            success=False,
            message="Profil kesehatan belum diisi"
        )
    
    return PatientHealthProfileResponse(
        success=True,
        message="Profil ditemukan",
        profile={
            "id": profile.id,
            "age": profile.age,
            "has_hypertension": profile.has_hypertension,
            "has_diabetes": profile.has_diabetes,
            "has_heart_disease": profile.has_heart_disease,
            "has_no_conditions": profile.has_no_conditions
        }
    )


# ============================================
# Mock Data (Legacy)
# ============================================

mock_patients = [
    Patient(
        id="P-2025-001",
        name="Ahmad Santoso",
        age=45,
        gender="Laki-laki",
        diagnosis="Stroke Iskemik",
        stroke_date=date(2024, 8, 15),
        notes="Pasien dalam tahap rehabilitasi aktif"
    ),
    Patient(
        id="P-2025-002",
        name="Siti Rahayu",
        age=58,
        gender="Perempuan",
        diagnosis="Stroke Hemoragik",
        stroke_date=date(2024, 6, 20),
        notes="Motorik tangan kanan terganggu"
    )
]


@router.get("/", response_model=List[Patient])
async def get_patients():
    """Get all patients"""
    return mock_patients


@router.get("/{patient_id}", response_model=Patient)
async def get_patient(patient_id: str):
    """Get patient by ID"""
    for patient in mock_patients:
        if patient.id == patient_id:
            return patient
    raise HTTPException(status_code=404, detail="Patient not found")


@router.post("/", response_model=Patient)
async def create_patient(data: PatientCreate):
    """Create new patient"""
    new_patient = Patient(
        id=f"P-2025-{len(mock_patients) + 1:03d}",
        **data.model_dump()
    )
    mock_patients.append(new_patient)
    return new_patient


@router.put("/{patient_id}", response_model=Patient)
async def update_patient(patient_id: str, data: PatientCreate):
    """Update patient"""
    for i, patient in enumerate(mock_patients):
        if patient.id == patient_id:
            updated = Patient(id=patient_id, **data.model_dump())
            mock_patients[i] = updated
            return updated
    raise HTTPException(status_code=404, detail="Patient not found")


@router.delete("/{patient_id}")
async def delete_patient(patient_id: str):
    """Delete patient"""
    for i, patient in enumerate(mock_patients):
        if patient.id == patient_id:
            del mock_patients[i]
            return {"message": "Patient deleted"}
    raise HTTPException(status_code=404, detail="Patient not found")


"""
Patient Management Routes
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

router = APIRouter()


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


# Mock data
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

"""
Patient Profile Model
Stores additional patient health information
"""
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class PatientProfile(Base):
    """Patient health profile table"""
    __tablename__ = "patient_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Basic info
    age = Column(Integer, nullable=True)
    
    # Medical conditions (stored as comma-separated or boolean flags)
    has_hypertension = Column(Boolean, default=False)
    has_diabetes = Column(Boolean, default=False)
    has_heart_disease = Column(Boolean, default=False)
    has_no_conditions = Column(Boolean, default=False)
    
    # Additional notes
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship
    user = relationship("User", back_populates="patient_profile")

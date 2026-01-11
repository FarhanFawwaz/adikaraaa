"""
Authentication Routes
Integrated with MySQL database
Using httpOnly cookies for secure authentication
"""
from fastapi import APIRouter, HTTPException, Depends, status, Response, Request, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional
from datetime import timedelta

from app.database import get_db
from app.models.user import User
from app.utils.auth import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    decode_access_token
)
from app.config import settings

router = APIRouter()
security = HTTPBearer(auto_error=False)

# Cookie settings
COOKIE_NAME = "access_token"
COOKIE_MAX_AGE = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60  # Convert to seconds


# ============================================
# Pydantic Models
# ============================================

class UserLogin(BaseModel):
    """Login request model"""
    email: EmailStr
    password: str


class UserRegister(BaseModel):
    """Register request model"""
    name: str
    email: EmailStr
    password: str
    role: str = "patient"


class AuthResponse(BaseModel):
    """Auth response model"""
    success: bool
    message: str
    user: Optional[dict] = None


class UserResponse(BaseModel):
    """User response model"""
    id: int
    name: str
    email: str
    role: str
    is_active: bool


# ============================================
# Helper Functions
# ============================================

def set_auth_cookie(response: Response, token: str):
    """Set httpOnly cookie with JWT token"""
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,  # Cannot be accessed by JavaScript
        secure=False,   # Set to True in production with HTTPS
        samesite="lax", # CSRF protection
        path="/"
    )


def delete_auth_cookie(response: Response):
    """Delete auth cookie"""
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/"
    )


async def get_current_user_from_cookie(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[User]:
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
# Routes
# ============================================

@router.post("/register", response_model=AuthResponse)
async def register(data: UserRegister, response: Response, db: Session = Depends(get_db)):
    """Register new user and set auth cookie"""
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar"
        )
    
    # Validate role
    if data.role not in ["patient", "therapist"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role tidak valid"
        )
    
    # Create new user
    hashed_password = get_password_hash(data.password)
    new_user = User(
        name=data.name,
        email=data.email,
        hashed_password=hashed_password,
        role=data.role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create token
    access_token = create_access_token(
        data={"sub": str(new_user.id), "email": new_user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    # Set httpOnly cookie
    set_auth_cookie(response, access_token)
    
    return AuthResponse(
        success=True,
        message="Registrasi berhasil",
        user={
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        }
    )


@router.post("/login", response_model=AuthResponse)
async def login(data: UserLogin, response: Response, db: Session = Depends(get_db)):
    """Login user and set auth cookie"""
    
    # Find user by email
    user = db.query(User).filter(User.email == data.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah"
        )
    
    # Verify password
    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah"
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun tidak aktif"
        )
    
    # Create token
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    # Set httpOnly cookie
    set_auth_cookie(response, access_token)
    
    return AuthResponse(
        success=True,
        message="Login berhasil",
        user={
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    )


@router.get("/me", response_model=AuthResponse)
async def get_me(request: Request, db: Session = Depends(get_db)):
    """Get current user info from cookie"""
    
    user = await get_current_user_from_cookie(request, db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tidak terautentikasi"
        )
    
    return AuthResponse(
        success=True,
        message="User authenticated",
        user={
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    )


@router.post("/logout", response_model=AuthResponse)
async def logout(response: Response):
    """Logout user by deleting auth cookie"""
    delete_auth_cookie(response)
    return AuthResponse(
        success=True,
        message="Logout berhasil"
    )


@router.get("/check")
async def check_auth(request: Request, db: Session = Depends(get_db)):
    """Check if user is authenticated (for frontend)"""
    user = await get_current_user_from_cookie(request, db)
    
    if user:
        return {
            "authenticated": True,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        }
    
    return {"authenticated": False, "user": None}


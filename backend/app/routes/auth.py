from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import SignupRequest, LoginRequest, AuthResponse, UserResponse, MessageResponse
from app.auth import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Bearer token extractor
security = HTTPBearer()


# ─── Signup ───────────────────────────────────────────────────────────────────

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    """
    Register a new user.

    - Validates that the email is not already in use.
    - Hashes the password with bcrypt before storing.
    - Returns a JWT access token on success.
    """
    # Check for duplicate email
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    # Create new user with hashed password
    new_user = User(
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Issue JWT
    token = create_access_token({"sub": new_user.email, "user_id": new_user.id})

    return AuthResponse(
        access_token=token,
        user=UserResponse.model_validate(new_user),
    )


# ─── Login ────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate an existing user.

    - Looks up the user by email.
    - Verifies the password against the stored bcrypt hash.
    - Returns a JWT access token on success.
    """
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token({"sub": user.email, "user_id": user.id})

    return AuthResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


# ─── Me (protected) ───────────────────────────────────────────────────────────

@router.get("/me", response_model=UserResponse)
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """
    Return the currently authenticated user's profile.

    Requires a valid Bearer token in the Authorization header.
    """
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.email == payload.get("sub")).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return UserResponse.model_validate(user)


# ─── Logout ───────────────────────────────────────────────────────────────────

@router.post("/logout", response_model=MessageResponse)
def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Logout endpoint.

    JWT tokens are stateless, so logout is handled on the client by deleting
    the stored token. This endpoint validates the token and returns a success
    message so the frontend can confirm the action cleanly.
    """
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )
    return MessageResponse(message="Logged out successfully.")

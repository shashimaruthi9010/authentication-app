from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional


# ─── Signup ──────────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    """Schema for user registration request."""
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    confirm_password: str

    @field_validator("first_name", "last_name")
    @classmethod
    def name_must_not_be_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("This field cannot be empty.")
        return v

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        return v

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match.")
        return v


# ─── Login ───────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    """Schema for user login request."""
    email: EmailStr
    password: str


# ─── Responses ───────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    """Public-safe user data returned to the frontend (no password_hash)."""
    id: int
    first_name: str
    last_name: str
    email: str

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Response returned after successful signup or login."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class MessageResponse(BaseModel):
    """Generic message response (e.g., for logout)."""
    message: str

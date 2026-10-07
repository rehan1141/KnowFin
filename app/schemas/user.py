from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Schema for validating user registration input."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, max_length=100)
    default_currency: Optional[str] = Field("EUR", min_length=3, max_length=3)


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    full_name: Optional[str] = Field(None, max_length=100)
    default_currency: Optional[str] = Field(None, min_length=3, max_length=3)


class UserResponse(BaseModel):
    """Schema for API responses — deliberately excludes password."""
    id: int
    email: str
    username: Optional[str] = None
    full_name: Optional[str] = None
    default_currency: str = "EUR"
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserInDB(UserResponse):
    """Internal schema that includes hashed_password (never returned to clients)."""
    hashed_password: str

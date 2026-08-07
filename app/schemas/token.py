from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Schema for data stored inside JWT token."""
    sub: Optional[str] = None

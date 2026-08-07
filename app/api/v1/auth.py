from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import create_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.
    - Validates email and password requirements via Pydantic.
    - Hashes password before saving to PostgreSQL.
    - Returns HTTP 201 Created with safe user data (no password).
    """
    return create_user(db=db, user_in=user_in)

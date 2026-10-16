from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import hash_password, verify_password
from app.services.default_data_service import seed_user_default_data


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Fetch a user by their email address (case-insensitive and trimmed)."""
    if not email:
        return None
    normalized_email = email.strip().lower()
    return db.query(User).filter(func.lower(User.email) == normalized_email).first()


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate user by email and password against stored hash."""
    if not email or not password:
        return None
    user = get_user_by_email(db, email=email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_user(db: Session, user_in: UserCreate) -> User:
    """
    Create a new user in PostgreSQL and auto-seed default financial categories and accounts.
    """
    normalized_email = user_in.email.strip().lower()
    existing_user = get_user_by_email(db, email=normalized_email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    db_user = User(
        email=normalized_email,
        hashed_password=hash_password(user_in.password),
        username=user_in.username.strip() if user_in.username else None,
        full_name=user_in.full_name.strip() if user_in.full_name else None,
        default_currency=(user_in.default_currency or "EUR").upper(),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Seed initial accounts and default categories
    try:
        seed_user_default_data(db, db_user.id, db_user.default_currency)
    except Exception:
        db.rollback()

    return db_user


def update_user_profile(db: Session, user: User, user_in: UserUpdate) -> User:
    """Update profile details such as full name and default currency."""
    if user_in.full_name is not None:
        user.full_name = user_in.full_name
    if user_in.default_currency is not None:
        user.default_currency = user_in.default_currency

    db.commit()
    db.refresh(user)
    return user

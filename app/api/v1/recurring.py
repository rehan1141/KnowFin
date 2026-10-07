from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.recurring import (
    RecurringTransactionCreate,
    RecurringTransactionUpdate,
    RecurringTransactionResponse,
    UpcomingSummaryResponse,
)
from app.services import recurring_service

router = APIRouter(prefix="/recurring", tags=["Recurring Transactions"])


@router.get("/", response_model=List[RecurringTransactionResponse])
def get_recurring_rules(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all recurring rules for user."""
    return recurring_service.list_recurring(db, user_id=current_user.id)


@router.get("/upcoming", response_model=UpcomingSummaryResponse)
def get_upcoming_payments(
    days: int = Query(30, ge=1, le=90, description="Number of days ahead to look"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve recurring expenses & income due in the next X days."""
    return recurring_service.get_upcoming_recurring(db, user_id=current_user.id, days_ahead=days)


@router.post("/", response_model=RecurringTransactionResponse, status_code=status.HTTP_201_CREATED)
def create_recurring_rule(
    rt_in: RecurringTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new recurring payment rule (e.g. Rent, Phone, Netflix)."""
    return recurring_service.create_recurring(db, rt_in=rt_in, user_id=current_user.id)


@router.put("/{recurring_id}", response_model=RecurringTransactionResponse)
def update_recurring_rule(
    recurring_id: int,
    rt_in: RecurringTransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a recurring payment rule."""
    return recurring_service.update_recurring(
        db, rt_id=recurring_id, rt_in=rt_in, user_id=current_user.id
    )


@router.delete("/{recurring_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recurring_rule(
    recurring_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a recurring payment rule."""
    recurring_service.delete_recurring(db, rt_id=recurring_id, user_id=current_user.id)
    return None

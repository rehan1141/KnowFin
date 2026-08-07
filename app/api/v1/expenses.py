from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.expense import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse,
    PaginatedExpenseResponse,
)
from app.services import expense_service

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new expense for the authenticated user."""
    return expense_service.create_expense(db, expense_in=expense_in, user_id=current_user.id)


@router.get("/", response_model=PaginatedExpenseResponse)
def read_expenses(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category"),
    start_date: Optional[datetime] = Query(None, description="Filter expenses on or after date"),
    end_date: Optional[datetime] = Query(None, description="Filter expenses on or before date"),
    sort_by: str = Query("expense_date", description="Field to sort by (expense_date, amount, title)"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve expenses owned by the current user with pagination, filtering, and sorting."""
    return expense_service.get_user_expenses(
        db,
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        category=category,
        start_date=start_date,
        end_date=end_date,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{expense_id}", response_model=ExpenseResponse)
def read_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve a specific expense by ID."""
    return expense_service.get_expense_by_id(
        db, expense_id=expense_id, user_id=current_user.id
    )


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense_in: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a specific expense."""
    return expense_service.update_expense(
        db, expense_id=expense_id, expense_in=expense_in, user_id=current_user.id
    )


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a specific expense."""
    expense_service.delete_expense(
        db, expense_id=expense_id, user_id=current_user.id
    )
    return None

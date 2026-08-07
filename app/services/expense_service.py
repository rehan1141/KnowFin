import math
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


def create_expense(db: Session, expense_in: ExpenseCreate, user_id: int) -> Expense:
    """Create a new expense record for the user."""
    db_expense = Expense(
        title=expense_in.title,
        amount=expense_in.amount,
        category=expense_in.category or "Uncategorized",
        expense_date=expense_in.expense_date,
        user_id=user_id,
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


def get_user_expenses(
    db: Session,
    user_id: int,
    page: int = 1,
    page_size: int = 10,
    category: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    sort_by: str = "expense_date",
    sort_order: str = "desc",
) -> dict:
    """Retrieve expenses owned by user with pagination, filtering, and sorting."""
    query = db.query(Expense).filter(Expense.user_id == user_id)

    # Filtering
    if category:
        query = query.filter(Expense.category.ilike(f"%{category}%"))
    if start_date:
        query = query.filter(Expense.expense_date >= start_date)
    if end_date:
        query = query.filter(Expense.expense_date <= end_date)

    # Total count before pagination
    total = query.count()

    # Sorting — validate sort_by against explicit allowlist to prevent attribute injection
    ALLOWED_SORT_FIELDS = {"expense_date", "amount", "title"}
    if sort_by not in ALLOWED_SORT_FIELDS:
        sort_by = "expense_date"
    sort_column = getattr(Expense, sort_by)
    if sort_order.lower() == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    # Pagination calculation
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()
    pages = math.ceil(total / page_size) if total > 0 else 1

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": pages,
    }


def get_expense_by_id(db: Session, expense_id: int, user_id: int) -> Expense:
    """Retrieve a single expense by ID belonging to the user."""
    expense = (
        db.query(Expense)
        .filter(Expense.id == expense_id, Expense.user_id == user_id)
        .first()
    )
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found."
        )
    return expense


def update_expense(
    db: Session, expense_id: int, expense_in: ExpenseUpdate, user_id: int
) -> Expense:
    """Update an existing expense record."""
    expense = get_expense_by_id(db, expense_id=expense_id, user_id=user_id)
    update_data = expense_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(expense, field, value)

    db.commit()
    db.refresh(expense)
    return expense


def delete_expense(db: Session, expense_id: int, user_id: int) -> None:
    """Delete an expense record."""
    expense = get_expense_by_id(db, expense_id=expense_id, user_id=user_id)
    db.delete(expense)
    db.commit()

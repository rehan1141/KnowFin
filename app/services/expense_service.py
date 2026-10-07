import math
from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status

from app.models.expense import Expense
from app.models.category import Category
from app.models.account import Account
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


def create_expense(db: Session, expense_in: ExpenseCreate, user_id: int) -> Expense:
    """Create a new transaction (expense or income) for the user."""
    category_name = expense_in.category or "Uncategorized"
    
    if expense_in.category_id:
        category_obj = db.query(Category).filter(
            Category.id == expense_in.category_id,
            Category.user_id == user_id
        ).first()
        if category_obj:
            category_name = category_obj.name

    # If expense_date is not passed, default explicitly to current timestamp
    tx_date = expense_in.expense_date or datetime.now()

    db_expense = Expense(
        title=expense_in.title,
        amount=expense_in.amount,
        transaction_type=expense_in.transaction_type or "expense",
        category=category_name,
        category_id=expense_in.category_id,
        subcategory_id=expense_in.subcategory_id,
        account_id=expense_in.account_id,
        expense_date=tx_date,
        notes=expense_in.notes,
        user_id=user_id,
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


def _enrich_expense(tx: Expense, db: Session) -> Dict[str, Any]:
    acc_name = None
    if tx.account_id:
        acc = db.query(Account).filter(Account.id == tx.account_id).first()
        if acc:
            acc_name = acc.name

    cat_icon = "Folder"
    cat_color = "#1F6B50"
    if tx.category_id:
        cat = db.query(Category).filter(Category.id == tx.category_id).first()
        if cat:
            cat_icon = cat.icon
            cat_color = cat.color

    sub_name = None
    if tx.subcategory_id:
        sub = db.query(Category).filter(Category.id == tx.subcategory_id).first()
        if sub:
            sub_name = sub.name

    return {
        "id": tx.id,
        "user_id": tx.user_id,
        "title": tx.title,
        "amount": tx.amount,
        "transaction_type": tx.transaction_type,
        "category": tx.category,
        "category_id": tx.category_id,
        "subcategory_id": tx.subcategory_id,
        "account_id": tx.account_id,
        "expense_date": tx.expense_date,
        "notes": tx.notes,
        "account_name": acc_name,
        "category_icon": cat_icon,
        "category_color": cat_color,
        "subcategory_name": sub_name,
    }


def get_user_expenses(
    db: Session,
    user_id: int,
    page: int = 1,
    page_size: int = 10,
    category: Optional[str] = None,
    transaction_type: Optional[str] = None,
    account_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    search: Optional[str] = None,
    sort_by: str = "expense_date",
    sort_order: str = "desc",
) -> Dict[str, Any]:
    """Retrieve transactions owned by user with pagination, filtering, search, and sorting."""
    query = db.query(Expense).filter(Expense.user_id == user_id)

    # Filtering
    if transaction_type:
        query = query.filter(Expense.transaction_type == transaction_type)
    if category:
        query = query.filter(Expense.category.ilike(f"%{category}%"))
    if account_id:
        query = query.filter(Expense.account_id == account_id)
    if start_date:
        query = query.filter(Expense.expense_date >= start_date)
    if end_date:
        query = query.filter(Expense.expense_date <= end_date)
    if search:
        query = query.filter(
            (Expense.title.ilike(f"%{search}%")) | (Expense.notes.ilike(f"%{search}%"))
        )

    # Compute totals before pagination
    total_income = (
        query.filter(Expense.transaction_type == "income")
        .with_entities(func.coalesce(func.sum(Expense.amount), Decimal("0.00")))
        .scalar()
        or Decimal("0.00")
    )
    total_expenses = (
        query.filter(Expense.transaction_type == "expense")
        .with_entities(func.coalesce(func.sum(Expense.amount), Decimal("0.00")))
        .scalar()
        or Decimal("0.00")
    )

    total = query.count()

    ALLOWED_SORT_FIELDS = {"expense_date", "amount", "title"}
    if sort_by not in ALLOWED_SORT_FIELDS:
        sort_by = "expense_date"
    sort_column = getattr(Expense, sort_by)
    if sort_order.lower() == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()
    pages = math.ceil(total / page_size) if total > 0 else 1

    enriched_items = [_enrich_expense(it, db) for it in items]

    return {
        "items": enriched_items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": pages,
        "total_income": total_income,
        "total_expenses": total_expenses,
    }


def get_expense_by_id(db: Session, expense_id: int, user_id: int) -> Dict[str, Any]:
    expense = (
        db.query(Expense)
        .filter(Expense.id == expense_id, Expense.user_id == user_id)
        .first()
    )
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")
    return _enrich_expense(expense, db)


def update_expense(
    db: Session, expense_id: int, expense_in: ExpenseUpdate, user_id: int
) -> Dict[str, Any]:
    expense = (
        db.query(Expense)
        .filter(Expense.id == expense_id, Expense.user_id == user_id)
        .first()
    )
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")

    update_data = expense_in.model_dump(exclude_unset=True)

    if "category_id" in update_data and update_data["category_id"]:
        category_obj = db.query(Category).filter(
            Category.id == update_data["category_id"],
            Category.user_id == user_id
        ).first()
        if category_obj:
            update_data["category"] = category_obj.name

    for field, value in update_data.items():
        setattr(expense, field, value)

    db.commit()
    db.refresh(expense)
    return _enrich_expense(expense, db)


def delete_expense(db: Session, expense_id: int, user_id: int) -> None:
    expense = (
        db.query(Expense)
        .filter(Expense.id == expense_id, Expense.user_id == user_id)
        .first()
    )
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")
    db.delete(expense)
    db.commit()

from decimal import Decimal
from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.models.expense import Expense
from app.models.category import Category
from app.models.budget import Budget


def get_monthly_summary(db: Session, user_id: int, month: int, year: int) -> Dict[str, Any]:
    """Calculate total spending and transaction count for a given month/year using SQL aggregations."""
    result = (
        db.query(
            func.coalesce(func.sum(Expense.amount), Decimal("0.00")).label("total_spent"),
            func.count(Expense.id).label("total_transactions"),
        )
        .filter(
            Expense.user_id == user_id,
            extract("month", Expense.expense_date) == month,
            extract("year", Expense.expense_date) == year,
        )
        .first()
    )

    return {
        "month": month,
        "year": year,
        "total_spent": result.total_spent or Decimal("0.00"),
        "total_transactions": result.total_transactions or 0,
    }


def get_spending_by_category(db: Session, user_id: int, month: int, year: int) -> Dict[str, Any]:
    """Group spending by category and calculate percentages using SQL GROUP BY."""
    total_spent = (
        db.query(func.coalesce(func.sum(Expense.amount), Decimal("0.00")))
        .filter(
            Expense.user_id == user_id,
            extract("month", Expense.expense_date) == month,
            extract("year", Expense.expense_date) == year,
        )
        .scalar()
        or Decimal("0.00")
    )

    category_results = (
        db.query(
            Expense.category,
            func.sum(Expense.amount).label("cat_total"),
        )
        .filter(
            Expense.user_id == user_id,
            extract("month", Expense.expense_date) == month,
            extract("year", Expense.expense_date) == year,
        )
        .group_by(Expense.category)
        .all()
    )

    categories = []
    for cat_name, cat_total in category_results:
        pct = (float(cat_total) / float(total_spent) * 100) if total_spent > 0 else 0.0
        categories.append({
            "category": cat_name,
            "total_spent": cat_total,
            "percentage": round(pct, 2),
        })

    return {
        "month": month,
        "year": year,
        "total_spent": total_spent,
        "categories": categories,
    }


def get_budget_status(db: Session, user_id: int, month: int, year: int) -> Dict[str, Any]:
    """
    Compare set budget limits against actual spending per category.

    Uses a single JOIN + GROUP BY query to avoid N+1 database queries.
    """
    rows = (
        db.query(
            Budget.id.label("budget_id"),
            Budget.monthly_limit,
            Category.id.label("category_id"),
            Category.name.label("category_name"),
            func.coalesce(func.sum(Expense.amount), Decimal("0.00")).label("total_spent"),
        )
        .join(Category, Budget.category_id == Category.id)
        .outerjoin(
            Expense,
            (Expense.category_id == Category.id)
            & (Expense.user_id == user_id)
            & (extract("month", Expense.expense_date) == month)
            & (extract("year", Expense.expense_date) == year),
        )
        .filter(Budget.user_id == user_id, Budget.month == month, Budget.year == year)
        .group_by(Budget.id, Budget.monthly_limit, Category.id, Category.name)
        .all()
    )

    budget_items = []
    for row in rows:
        remaining = row.monthly_limit - row.total_spent
        budget_items.append({
            "category_id": row.category_id,
            "category_name": row.category_name,
            "monthly_limit": row.monthly_limit,
            "total_spent": row.total_spent,
            "remaining": remaining,
            "is_exceeded": row.total_spent > row.monthly_limit,
        })

    return {
        "month": month,
        "year": year,
        "budgets": budget_items,
    }

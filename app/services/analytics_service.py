from decimal import Decimal
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from sqlalchemy.sql import func

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
    """Compare set budget limits against actual spending per category."""
    user_budgets = (
        db.query(Budget, Category)
        .join(Category, Budget.category_id == Category.id)
        .filter(
            Budget.user_id == user_id,
            Budget.month == month,
            Budget.year == year,
        )
        .all()
    )

    budget_items = []
    for budget, category in user_budgets:
        spent = (
            db.query(func.coalesce(func.sum(Expense.amount), Decimal("0.00")))
            .filter(
                Expense.user_id == user_id,
                Expense.category_id == category.id,
                extract("month", Expense.expense_date) == month,
                extract("year", Expense.expense_date) == year,
            )
            .scalar()
            or Decimal("0.00")
        )

        remaining = budget.monthly_limit - spent
        budget_items.append({
            "category_id": category.id,
            "category_name": category.name,
            "monthly_limit": budget.monthly_limit,
            "total_spent": spent,
            "remaining": remaining,
            "is_exceeded": spent > budget.monthly_limit,
        })

    return {
        "month": month,
        "year": year,
        "budgets": budget_items,
    }

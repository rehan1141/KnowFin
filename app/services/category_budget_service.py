from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status

from app.models.category import Category
from app.models.budget import Budget
from app.models.expense import Expense
from app.schemas.category_budget import CategoryCreate, CategoryUpdate, BudgetCreate


# Category Services
def create_category(db: Session, category_in: CategoryCreate, user_id: int) -> Category:
    existing = (
        db.query(Category)
        .filter(
            Category.name.ilike(category_in.name),
            Category.user_id == user_id,
            Category.parent_id == category_in.parent_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{category_in.name}' already exists."
        )

    db_category = Category(
        name=category_in.name,
        category_type=category_in.category_type,
        icon=category_in.icon,
        color=category_in.color,
        parent_id=category_in.parent_id,
        user_id=user_id,
        is_default=False,
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def get_user_categories(db: Session, user_id: int, category_type: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieve parent categories with nested subcategories and transaction counts."""
    query = db.query(Category).filter(Category.user_id == user_id, Category.parent_id.is_(None))
    if category_type:
        query = query.filter(Category.category_type == category_type)
    parents = query.order_by(Category.name.asc()).all()

    result = []
    for parent in parents:
        subcats = (
            db.query(Category)
            .filter(Category.user_id == user_id, Category.parent_id == parent.id)
            .order_by(Category.name.asc())
            .all()
        )
        tx_count = (
            db.query(func.count(Expense.id))
            .filter(Expense.user_id == user_id, (Expense.category_id == parent.id) | (Expense.category == parent.name))
            .scalar()
            or 0
        )

        result.append({
            "id": parent.id,
            "name": parent.name,
            "category_type": parent.category_type,
            "icon": parent.icon,
            "color": parent.color,
            "parent_id": parent.parent_id,
            "user_id": parent.user_id,
            "is_default": parent.is_default,
            "created_at": parent.created_at,
            "transaction_count": tx_count,
            "subcategories": [
                {
                    "id": sub.id,
                    "name": sub.name,
                    "category_type": sub.category_type,
                    "icon": sub.icon,
                    "color": sub.color,
                    "parent_id": sub.parent_id,
                    "user_id": sub.user_id,
                    "created_at": sub.created_at,
                }
                for sub in subcats
            ],
        })

    return result


def update_category(db: Session, category_id: int, category_in: CategoryUpdate, user_id: int) -> Category:
    cat = db.query(Category).filter(Category.id == category_id, Category.user_id == user_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    update_data = category_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(cat, field, val)

    db.commit()
    db.refresh(cat)
    return cat


def delete_category(db: Session, category_id: int, user_id: int) -> None:
    """Safe category deletion with check for linked transactions."""
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.user_id == user_id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    # Check if any transactions reference this category
    tx_count = (
        db.query(func.count(Expense.id))
        .filter(Expense.user_id == user_id, (Expense.category_id == category_id) | (Expense.category == category.name))
        .scalar()
        or 0
    )
    if tx_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete '{category.name}' because {tx_count} transaction(s) are assigned to it. Reassign or delete them first."
        )

    db.delete(category)
    db.commit()


# Budget Services
def create_or_update_budget(db: Session, budget_in: BudgetCreate, user_id: int) -> Dict[str, Any]:
    category = (
        db.query(Category)
        .filter(Category.id == budget_in.category_id, Category.user_id == user_id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    existing = (
        db.query(Budget)
        .filter(
            Budget.category_id == budget_in.category_id,
            Budget.month == budget_in.month,
            Budget.year == budget_in.year,
            Budget.user_id == user_id,
        )
        .first()
    )

    if existing:
        existing.monthly_limit = budget_in.monthly_limit
        db.commit()
        db.refresh(existing)
        return {
            "id": existing.id,
            "category_id": existing.category_id,
            "monthly_limit": existing.monthly_limit,
            "month": existing.month,
            "year": existing.year,
            "user_id": existing.user_id,
            "created_at": existing.created_at,
            "category_name": category.name,
            "category_icon": category.icon,
            "category_color": category.color,
        }

    db_budget = Budget(
        category_id=budget_in.category_id,
        user_id=user_id,
        monthly_limit=budget_in.monthly_limit,
        month=budget_in.month,
        year=budget_in.year,
    )
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)

    return {
        "id": db_budget.id,
        "category_id": db_budget.category_id,
        "monthly_limit": db_budget.monthly_limit,
        "month": db_budget.month,
        "year": db_budget.year,
        "user_id": db_budget.user_id,
        "created_at": db_budget.created_at,
        "category_name": category.name,
        "category_icon": category.icon,
        "category_color": category.color,
    }


def get_user_budgets(db: Session, user_id: int) -> List[Dict[str, Any]]:
    budgets = (
        db.query(Budget, Category)
        .join(Category, Budget.category_id == Category.id)
        .filter(Budget.user_id == user_id)
        .order_by(Budget.year.desc(), Budget.month.desc())
        .all()
    )

    return [
        {
            "id": b.id,
            "category_id": b.category_id,
            "monthly_limit": b.monthly_limit,
            "month": b.month,
            "year": b.year,
            "user_id": b.user_id,
            "created_at": b.created_at,
            "category_name": c.name,
            "category_icon": c.icon,
            "category_color": c.color,
        }
        for b, c in budgets
    ]


def delete_budget(db: Session, budget_id: int, user_id: int) -> None:
    b = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()
    if not b:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found.")
    db.delete(b)
    db.commit()

from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.category import Category
from app.models.budget import Budget
from app.schemas.category_budget import CategoryCreate, BudgetCreate


# Category Services
def create_category(db: Session, category_in: CategoryCreate, user_id: int) -> Category:
    existing = (
        db.query(Category)
        .filter(Category.name.ilike(category_in.name), Category.user_id == user_id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{category_in.name}' already exists."
        )

    db_category = Category(name=category_in.name, user_id=user_id)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def get_user_categories(db: Session, user_id: int) -> List[Category]:
    return db.query(Category).filter(Category.user_id == user_id).all()


def delete_category(db: Session, category_id: int, user_id: int) -> None:
    """Delete a category. Expenses with this category will have category_id set to NULL."""
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.user_id == user_id)
        .first()
    )
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found."
        )
    db.delete(category)
    db.commit()


# Budget Services
def create_or_update_budget(db: Session, budget_in: BudgetCreate, user_id: int) -> Budget:
    # Verify category belongs to user
    category = (
        db.query(Category)
        .filter(Category.id == budget_in.category_id, Category.user_id == user_id)
        .first()
    )
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found."
        )

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
        return existing

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
    return db_budget


def get_user_budgets(db: Session, user_id: int) -> List[Budget]:
    return db.query(Budget).filter(Budget.user_id == user_id).all()

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.category_budget import (
    CategoryCreate,
    CategoryResponse,
    BudgetCreate,
    BudgetResponse,
)
from app.services import category_budget_service

categories_router = APIRouter(prefix="/categories", tags=["Categories"])
budgets_router = APIRouter(prefix="/budgets", tags=["Budgets"])


# Categories Endpoints
@categories_router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a user-defined expense category."""
    return category_budget_service.create_category(
        db, category_in=category_in, user_id=current_user.id
    )


@categories_router.get("/", response_model=List[CategoryResponse])
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all categories for the authenticated user."""
    return category_budget_service.get_user_categories(db, user_id=current_user.id)


# Budgets Endpoints
@budgets_router.post("/", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def set_budget(
    budget_in: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Set or update a monthly budget for a category."""
    return category_budget_service.create_or_update_budget(
        db, budget_in=budget_in, user_id=current_user.id
    )


@budgets_router.get("/", response_model=List[BudgetResponse])
def get_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all budgets for the authenticated user."""
    return category_budget_service.get_user_budgets(db, user_id=current_user.id)

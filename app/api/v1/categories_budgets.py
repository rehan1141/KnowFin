from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.category_budget import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    BudgetCreate,
    BudgetResponse,
)
from app.services import category_budget_service

categories_router = APIRouter(prefix="/categories", tags=["Categories"])
budgets_router = APIRouter(prefix="/budgets", tags=["Budgets"])


# ── Categories Endpoints ──────────────────────────────────────────────────────
@categories_router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a user-defined category or subcategory with icon and color."""
    cat = category_budget_service.create_category(
        db, category_in=category_in, user_id=current_user.id
    )
    return {
        "id": cat.id,
        "name": cat.name,
        "category_type": cat.category_type,
        "icon": cat.icon,
        "color": cat.color,
        "parent_id": cat.parent_id,
        "user_id": cat.user_id,
        "is_default": cat.is_default,
        "created_at": cat.created_at,
        "subcategories": [],
        "transaction_count": 0,
    }


@categories_router.get("/", response_model=List[CategoryResponse])
def get_categories(
    type: Optional[str] = Query(None, description="Filter by category_type (expense or income)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all categories and nested subcategories for the user."""
    return category_budget_service.get_user_categories(db, user_id=current_user.id, category_type=type)


@categories_router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update category details (name, icon, color, type)."""
    cat = category_budget_service.update_category(
        db, category_id=category_id, category_in=category_in, user_id=current_user.id
    )
    return {
        "id": cat.id,
        "name": cat.name,
        "category_type": cat.category_type,
        "icon": cat.icon,
        "color": cat.color,
        "parent_id": cat.parent_id,
        "user_id": cat.user_id,
        "is_default": cat.is_default,
        "created_at": cat.created_at,
        "subcategories": [],
        "transaction_count": 0,
    }


@categories_router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Safely delete a category. Fails if transactions are still assigned."""
    category_budget_service.delete_category(db, category_id=category_id, user_id=current_user.id)
    return None


# ── Budgets Endpoints ─────────────────────────────────────────────────────────
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
    """Retrieve all budgets with category metadata for user."""
    return category_budget_service.get_user_budgets(db, user_id=current_user.id)


@budgets_router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a budget limit."""
    category_budget_service.delete_budget(db, budget_id=budget_id, user_id=current_user.id)
    return None

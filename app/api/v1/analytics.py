from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.analytics import (
    MonthlySummaryResponse,
    CategorySpendingResponse,
    BudgetStatusResponse,
    CashFlowResponse,
)
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", response_model=MonthlySummaryResponse)
def get_monthly_summary(
    month: int = Query(..., ge=1, le=12, description="Month (1-12)"),
    year: int = Query(..., ge=2000, le=2100, description="Year (e.g., 2026)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve monthly total spending, income, net savings, and financial metrics."""
    return analytics_service.get_monthly_summary(
        db, user_id=current_user.id, month=month, year=year
    )


@router.get("/by-category", response_model=CategorySpendingResponse)
def get_spending_by_category(
    month: int = Query(..., ge=1, le=12, description="Month (1-12)"),
    year: int = Query(..., ge=2000, le=2100, description="Year (e.g., 2026)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve breakdown of spending grouped by category with icons and colors."""
    return analytics_service.get_spending_by_category(
        db, user_id=current_user.id, month=month, year=year
    )


@router.get("/budget-status", response_model=BudgetStatusResponse)
def get_budget_status(
    month: int = Query(..., ge=1, le=12, description="Month (1-12)"),
    year: int = Query(..., ge=2000, le=2100, description="Year (e.g., 2026)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve status of set category budgets vs actual spending."""
    return analytics_service.get_budget_status(
        db, user_id=current_user.id, month=month, year=year
    )


@router.get("/cash-flow", response_model=CashFlowResponse)
def get_cash_flow(
    month: int = Query(..., ge=1, le=12, description="Month (1-12)"),
    year: int = Query(..., ge=2000, le=2100, description="Year (e.g., 2026)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve daily cash flow series for charting income vs expenses."""
    return analytics_service.get_cash_flow_timeline(
        db, user_id=current_user.id, month=month, year=year
    )

from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel


class MonthlySummaryResponse(BaseModel):
    month: int
    year: int
    total_income: Decimal
    total_spent: Decimal
    net_savings: Decimal
    savings_rate: float
    total_transactions: int
    fixed_expenses: Decimal
    variable_expenses: Decimal
    average_daily_spending: Decimal
    total_balance: Decimal


class CategorySpending(BaseModel):
    category_id: Optional[int] = None
    category: str
    icon: str = "Folder"
    color: str = "#1F6B50"
    total_spent: Decimal
    percentage: float
    transaction_count: int = 0


class CategorySpendingResponse(BaseModel):
    month: int
    year: int
    total_spent: Decimal
    categories: List[CategorySpending]


class BudgetStatusItem(BaseModel):
    budget_id: int
    category_id: int
    category_name: str
    category_icon: str = "Folder"
    category_color: str = "#1F6B50"
    monthly_limit: Decimal
    total_spent: Decimal
    remaining: Decimal
    percentage: float
    is_exceeded: bool
    status: str  # "on_track", "warning", "exceeded"


class BudgetStatusResponse(BaseModel):
    month: int
    year: int
    total_budgeted: Decimal
    total_spent_budgeted: Decimal
    budgets: List[BudgetStatusItem]


class CashFlowPoint(BaseModel):
    date: str
    income: Decimal
    expense: Decimal
    net: Decimal


class CashFlowResponse(BaseModel):
    month: int
    year: int
    points: List[CashFlowPoint]

from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel


class MonthlySummaryResponse(BaseModel):
    month: int
    year: int
    total_spent: Decimal
    total_transactions: int


class CategorySpending(BaseModel):
    category: str
    total_spent: Decimal
    percentage: float


class CategorySpendingResponse(BaseModel):
    month: int
    year: int
    total_spent: Decimal
    categories: List[CategorySpending]


class BudgetStatusItem(BaseModel):
    category_id: int
    category_name: str
    monthly_limit: Decimal
    total_spent: Decimal
    remaining: Decimal
    is_exceeded: bool


class BudgetStatusResponse(BaseModel):
    month: int
    year: int
    budgets: List[BudgetStatusItem]

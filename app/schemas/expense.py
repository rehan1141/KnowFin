from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field


class ExpenseBase(BaseModel):
    """Base schema for transaction/expense fields."""
    title: str = Field(..., min_length=1, max_length=255)
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    transaction_type: str = Field("expense", pattern="^(expense|income|transfer)$")
    category: Optional[str] = Field("Uncategorized", max_length=50)
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None
    account_id: Optional[int] = None
    expense_date: Optional[datetime] = None
    notes: Optional[str] = None


class ExpenseCreate(ExpenseBase):
    """Schema for creating a new transaction."""
    pass


class ExpenseUpdate(BaseModel):
    """Schema for updating an existing transaction (all fields optional)."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    transaction_type: Optional[str] = Field(None, pattern="^(expense|income|transfer)$")
    category: Optional[str] = Field(None, max_length=50)
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None
    account_id: Optional[int] = None
    expense_date: Optional[datetime] = None
    notes: Optional[str] = None


class ExpenseResponse(ExpenseBase):
    """Schema for API responses returning a transaction."""
    id: int
    user_id: int
    expense_date: datetime
    account_name: Optional[str] = None
    category_icon: Optional[str] = None
    category_color: Optional[str] = None
    subcategory_name: Optional[str] = None

    model_config = {"from_attributes": True}


class PaginatedExpenseResponse(BaseModel):
    """Schema for paginated transaction responses."""
    items: List[ExpenseResponse]
    total: int
    page: int
    page_size: int
    pages: int
    total_income: Optional[Decimal] = Decimal("0.00")
    total_expenses: Optional[Decimal] = Decimal("0.00")

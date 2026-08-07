from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field


class ExpenseBase(BaseModel):
    """Base schema for expense fields."""
    title: str = Field(..., min_length=1, max_length=255)
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    category: Optional[str] = Field("Uncategorized", max_length=50)
    expense_date: Optional[datetime] = None


class ExpenseCreate(ExpenseBase):
    """Schema for creating a new expense."""
    pass


class ExpenseUpdate(BaseModel):
    """Schema for updating an existing expense (all fields optional)."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    category: Optional[str] = Field(None, max_length=50)
    expense_date: Optional[datetime] = None


class ExpenseResponse(ExpenseBase):
    """Schema for API responses returning an expense."""
    id: int
    user_id: int
    expense_date: datetime

    model_config = {"from_attributes": True}


class PaginatedExpenseResponse(BaseModel):
    """Schema for paginated expense responses."""
    items: List[ExpenseResponse]
    total: int
    page: int
    page_size: int
    pages: int


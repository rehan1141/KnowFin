from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field


class RecurringTransactionBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    transaction_type: str = Field("expense", pattern="^(expense|income)$")
    account_id: Optional[int] = None
    category_id: Optional[int] = None
    frequency: str = Field("monthly", pattern="^(daily|weekly|monthly|yearly)$")
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    day_of_month: Optional[int] = Field(None, ge=1, le=31)
    is_active: bool = True
    notes: Optional[str] = None


class RecurringTransactionCreate(RecurringTransactionBase):
    pass


class RecurringTransactionUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    transaction_type: Optional[str] = Field(None, pattern="^(expense|income)$")
    account_id: Optional[int] = None
    category_id: Optional[int] = None
    frequency: Optional[str] = Field(None, pattern="^(daily|weekly|monthly|yearly)$")
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    day_of_month: Optional[int] = Field(None, ge=1, le=31)
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class RecurringTransactionResponse(RecurringTransactionBase):
    id: int
    user_id: int
    account_name: Optional[str] = None
    category_name: Optional[str] = None
    category_icon: Optional[str] = None
    category_color: Optional[str] = None
    next_due_date: Optional[datetime] = None
    days_until_due: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UpcomingSummaryResponse(BaseModel):
    items: List[RecurringTransactionResponse]
    total_upcoming_expenses: Decimal
    total_upcoming_income: Decimal

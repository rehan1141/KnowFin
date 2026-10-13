from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field


class AccountBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    account_type: str = Field("bank", max_length=50)  # bank, cash, savings, credit_card, investment
    currency: str = Field("EUR", min_length=3, max_length=3)
    initial_balance: Optional[Decimal] = Field(None, decimal_places=2)


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    account_type: Optional[str] = Field(None, max_length=50)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    initial_balance: Optional[Decimal] = Field(None, decimal_places=2)
    is_active: Optional[bool] = None


class AccountResponse(AccountBase):
    id: int
    user_id: int
    is_active: bool
    current_balance: Optional[Decimal] = None
    is_balance_set: bool = False
    total_income: Decimal
    total_expenses: Decimal
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class AccountListResponse(BaseModel):
    accounts: List[AccountResponse]
    total_balance: Optional[Decimal] = None
    is_balance_set: bool = False

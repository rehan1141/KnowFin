from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field


class TransferCreate(BaseModel):
    from_account_id: int = Field(..., description="Source account to debit")
    to_account_id: int = Field(..., description="Destination account to credit")
    amount: Decimal = Field(..., gt=0, decimal_places=2, description="Transfer amount must be positive")
    description: Optional[str] = Field(None, max_length=255, description="Optional description of transfer")
    date: Optional[datetime] = Field(None, description="Timestamp of transfer; defaults to now")


class TransferResponse(BaseModel):
    transfer_out_id: int
    transfer_in_id: int
    from_account_id: int
    to_account_id: int
    amount: Decimal
    description: Optional[str] = None
    date: datetime

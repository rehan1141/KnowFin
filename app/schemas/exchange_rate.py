from datetime import datetime
from typing import Dict
from pydantic import BaseModel, Field


class ExchangeRatesResponse(BaseModel):
    """Schema for reporting exchange rates with timestamp and status."""
    base: str = Field("EUR", description="Base currency (always EUR)")
    rates: Dict[str, float] = Field(..., description="Exchange rates mapping currency symbol to numeric rate")
    last_updated: datetime = Field(..., description="Timestamp when rates were last retrieved from source")
    source: str = Field(..., description="Data provider citation (e.g. European Central Bank)")
    is_stale: bool = Field(False, description="True if rates are served from fallback cache due to provider downtime")

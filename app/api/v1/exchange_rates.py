from fastapi import APIRouter, Query
from app.schemas.exchange_rate import ExchangeRatesResponse
from app.services.exchange_rate_service import exchange_rate_service

router = APIRouter(prefix="/exchange-rates", tags=["Exchange Rates"])


@router.get("", response_model=ExchangeRatesResponse)
@router.get("/latest", response_model=ExchangeRatesResponse)
async def get_latest_exchange_rates(
    refresh: bool = Query(False, description="Force refresh from external rate provider")
):
    """
    Retrieve current exchange rates with EUR as canonical base currency.
    Includes last updated timestamp, provider source, and stale status.
    """
    return await exchange_rate_service.get_latest_rates(force_refresh=refresh)


@router.post("/refresh", response_model=ExchangeRatesResponse)
async def force_refresh_exchange_rates():
    """Force an immediate refresh of exchange rates from external rate providers."""
    return await exchange_rate_service.get_latest_rates(force_refresh=True)

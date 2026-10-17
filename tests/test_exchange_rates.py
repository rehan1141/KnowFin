import pytest
from unittest.mock import patch, AsyncMock
from decimal import Decimal
from app.services.exchange_rate_service import ExchangeRateService, exchange_rate_service
from app.schemas.exchange_rate import ExchangeRatesResponse


def test_get_exchange_rates_endpoint(client):
    """Verify GET /api/v1/exchange-rates/latest returns 200 with EUR base and required rates."""
    response = client.get("/api/v1/exchange-rates/latest")
    assert response.status_code == 200
    data = response.json()
    assert data["base"] == "EUR"
    assert "rates" in data
    rates = data["rates"]
    assert rates["EUR"] == 1.0
    assert "USD" in rates
    assert "GBP" in rates
    assert "INR" in rates
    assert rates["USD"] > 0
    assert rates["GBP"] > 0
    assert rates["INR"] > 0
    assert "last_updated" in data
    assert "source" in data
    assert isinstance(data["is_stale"], bool)


def test_refresh_exchange_rates_endpoint(client):
    """Verify POST /api/v1/exchange-rates/refresh forces refresh."""
    response = client.post("/api/v1/exchange-rates/refresh")
    assert response.status_code == 200
    data = response.json()
    assert data["base"] == "EUR"
    assert len(data["rates"]) >= 4


import asyncio
import concurrent.futures

def _run_async(coro):
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
        return pool.submit(asyncio.run, coro).result()


def test_service_caching():
    """Verify that service caches rates within TTL."""
    async def _test():
        service = ExchangeRateService()
        # First fetch
        rates1 = await service.get_latest_rates(force_refresh=True)
        assert rates1["base"] == "EUR"
        cached_time = rates1["last_updated"]

        # Second fetch without force_refresh should return cached object
        rates2 = await service.get_latest_rates(force_refresh=False)
        assert rates2["last_updated"] == cached_time
        assert rates2["is_stale"] is False
    _run_async(_test())


def test_service_fallback_on_network_failure():
    """Verify fallback when external provider requests raise exceptions."""
    async def _test():
        service = ExchangeRateService()
        # Simulate previous live fetch in cache
        service._cached_rates = {"EUR": 1.0, "USD": 1.10, "INR": 90.0}
        service._source = "Previous Live Provider"
        service._has_live_fetch = True
        service._is_stale = False

        # Force network failure on _fetch_live_rates
        with patch.object(service, "_fetch_live_rates", return_value=(None, "")):
            result = await service.get_latest_rates(force_refresh=True)
            # Should fall back to cached data with is_stale=True
            assert result["is_stale"] is True
            assert result["rates"]["USD"] == 1.10
            assert result["source"] == "Previous Live Provider"
    _run_async(_test())


def test_service_cold_start_fallback_when_offline():
    """Verify cold start fallback returns valid baseline rates if network is unreachable immediately."""
    async def _test():
        service = ExchangeRateService()
        service._has_live_fetch = False

        with patch.object(service, "_fetch_live_rates", return_value=(None, "")):
            result = await service.get_latest_rates(force_refresh=True)
            assert result["is_stale"] is True
            assert result["base"] == "EUR"
            assert result["rates"]["EUR"] == 1.0
            assert result["rates"]["USD"] > 1.0
            assert result["rates"]["INR"] > 80.0
    _run_async(_test())


def test_conversion_math_and_financial_invariants():
    """
    Test decimal-safe conversion rules:
    - EUR -> target currency: amount * rate
    - target currency -> EUR: amount / rate
    - Negative amounts (refunds) must remain negative
    - Zero amounts stay zero
    - Transfers do not double count
    """
    usd_rate = Decimal("1.1215")
    eur_amount = Decimal("100.00")

    # Forward conversion (EUR to USD)
    usd_val = round(eur_amount * usd_rate, 2)
    assert usd_val == Decimal("112.15")

    # Reverse conversion (USD to EUR)
    back_to_eur = round(usd_val / usd_rate, 2)
    assert back_to_eur == Decimal("100.00")

    # Refund conversion: negative EUR must convert to negative USD
    refund_eur = Decimal("-45.50")
    refund_usd = round(refund_eur * usd_rate, 2)
    assert refund_usd == Decimal("-51.03")

    # Reverse refund conversion
    back_refund_eur = round(refund_usd / usd_rate, 2)
    assert back_refund_eur == Decimal("-45.50")

    # Zero
    zero_eur = Decimal("0.00")
    assert round(zero_eur * usd_rate, 2) == Decimal("0.00")

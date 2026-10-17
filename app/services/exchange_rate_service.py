import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Optional, Tuple
import httpx

logger = logging.getLogger(__name__)

# Fallback reference rates (used only if external APIs are completely unreachable on cold start)
COLD_START_FALLBACK_RATES: Dict[str, float] = {
    "EUR": 1.0,
    "USD": 1.0850,
    "INR": 90.5000,
}

CACHE_TTL_MINUTES = 60


class ExchangeRateService:
    """
    Service to fetch, cache, and serve live exchange rates with EUR as the canonical base currency.
    Uses reputable open providers (open.er-api.com, European Central Bank via frankfurter.dev).
    """

    def __init__(self):
        self._cached_rates: Dict[str, float] = dict(COLD_START_FALLBACK_RATES)
        self._last_updated: datetime = datetime.now(timezone.utc)
        self._source: str = "Fallback Reference Rates"
        self._is_stale: bool = True
        self._has_live_fetch: bool = False

    async def get_latest_rates(self, force_refresh: bool = False) -> Dict:
        """
        Return the latest exchange rates for EUR base currency.
        Caches in-memory for CACHE_TTL_MINUTES unless force_refresh is True.
        """
        now = datetime.now(timezone.utc)
        is_cache_valid = (
            self._has_live_fetch
            and not force_refresh
            and (now - self._last_updated) < timedelta(minutes=CACHE_TTL_MINUTES)
        )

        if is_cache_valid:
            return {
                "base": "EUR",
                "rates": dict(self._cached_rates),
                "last_updated": self._last_updated,
                "source": self._source,
                "is_stale": self._is_stale,
            }

        # Attempt to fetch live rates
        fetched, source = await self._fetch_live_rates()

        if fetched:
            self._cached_rates = fetched
            self._last_updated = now
            self._source = source
            self._is_stale = False
            self._has_live_fetch = True
        else:
            # If live fetch fails, retain cached rates and mark stale
            self._is_stale = True
            logger.warning("Using cached/stale exchange rates because live fetch failed.")

        return {
            "base": "EUR",
            "rates": dict(self._cached_rates),
            "last_updated": self._last_updated,
            "source": self._source,
            "is_stale": self._is_stale,
        }

    async def _fetch_live_rates(self) -> Tuple[Optional[Dict[str, float]], str]:
        """Try primary provider (open.er-api.com) then secondary (frankfurter.dev)."""
        # Primary: Open Exchange Rates public endpoint (base EUR)
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get("https://open.er-api.com/v6/latest/EUR")
                if res.status_code == 200:
                    data = res.json()
                    rates = data.get("rates", {})
                    if "USD" in rates and "INR" in rates:
                        cleaned = {
                            "EUR": 1.0,
                            "USD": round(float(rates["USD"]), 6),
                            "INR": round(float(rates["INR"]), 6),
                        }
                        # Include any other common currencies if available
                        for curr in ["GBP", "CAD", "AUD", "JPY", "CHF"]:
                            if curr in rates:
                                cleaned[curr] = round(float(rates[curr]), 6)
                        return cleaned, "Open Exchange Rates API"
        except Exception as err:
            logger.warning("Primary exchange rate provider failed: %s", err)

        # Secondary fallback: Frankfurter (European Central Bank reference rates)
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get("https://api.frankfurter.dev/v1/latest?base=EUR")
                if res.status_code == 200:
                    data = res.json()
                    rates = data.get("rates", {})
                    if "USD" in rates and "INR" in rates:
                        cleaned = {
                            "EUR": 1.0,
                            "USD": round(float(rates["USD"]), 6),
                            "INR": round(float(rates["INR"]), 6),
                        }
                        for curr in ["GBP", "CAD", "AUD", "JPY", "CHF"]:
                            if curr in rates:
                                cleaned[curr] = round(float(rates[curr]), 6)
                        return cleaned, "European Central Bank (Frankfurter API)"
        except Exception as err:
            logger.warning("Secondary exchange rate provider failed: %s", err)

        return None, ""


exchange_rate_service = ExchangeRateService()

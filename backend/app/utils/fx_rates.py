import asyncio
import logging
from datetime import date
from typing import Optional

import httpx

from app.core.cache import cached

logger = logging.getLogger(__name__)

FX_PAIRS: dict[str, str] = {
    "USD_HKD": "USD_HKD",
    "USD_CNH": "USD_CNH",
    "HKD_CNH": "HKD_CNH",
    "USD_SGD": "USD_SGD",
    "USD_JPY": "USD_JPY",
}


class FxRateProvider:
    def __init__(self, provider: str = "frankfurter"):
        self.provider = provider
        self._http = httpx.AsyncClient(timeout=10.0)

    async def get_rate(self, from_currency: str, to_currency: str) -> float:
        """Get current FX rate between two currencies."""
        if from_currency == to_currency:
            return 1.0

        pair = f"{from_currency}_{to_currency}"
        reverse_pair = f"{to_currency}_{from_currency}"

        if self.provider == "frankfurter":
            rate = await self._fetch_frankfurter(from_currency, to_currency)
            return rate

        raise ValueError(f"Unknown FX provider: {self.provider}")

    async def get_historical_rate(
        self, from_currency: str, to_currency: str, dt: date
    ) -> float:
        """Get historical FX rate for a specific date."""
        if from_currency == to_currency:
            return 1.0

        if self.provider == "frankfurter":
            return await self._fetch_frankfurter(from_currency, to_currency, dt)

        raise ValueError(f"Unknown FX provider: {self.provider}")

    @cached("fx_rates", ttl=3600)
    async def _fetch_frankfurter(
        self,
        from_currency: str,
        to_currency: str,
        dt: Optional[date] = None,
    ) -> float:
        base_url = "https://api.frankfurter.app"
        if dt:
            url = f"{base_url}/{dt.isoformat()}?from={from_currency}&to={to_currency}"
        else:
            url = f"{base_url}/latest?from={from_currency}&to={to_currency}"

        try:
            resp = await self._http.get(url)
            resp.raise_for_status()
            data = resp.json()
            return data["rates"][to_currency]
        except Exception as e:
            logger.error(f"Failed to fetch FX rate {from_currency}/{to_currency}: {e}")
            raise

    async def close(self):
        await self._http.aclose()


fx_provider = FxRateProvider()

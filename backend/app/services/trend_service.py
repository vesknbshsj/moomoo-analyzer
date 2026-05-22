import logging

import pandas as pd

from app.core.cache import cached
from app.core.futu_client import futu_client
from app.models.trend import IndicatorSet, KlineBar, KlineData, SrLevelsResponse, SRLevel, StockInfo
from app.utils.technical import compute_indicators, detect_support_resistance

logger = logging.getLogger(__name__)

KL_TYPE_MAP = {
    "K_1M": "K_1M",
    "K_5M": "K_5M",
    "K_15M": "K_15M",
    "K_30M": "K_30M",
    "K_60M": "K_60M",
    "K_DAY": "K_DAY",
    "K_WEEK": "K_WEEK",
    "K_MON": "K_MON",
    "K_QUARTER": "K_QUARTER",
    "K_YEAR": "K_YEAR",
}


class TrendService:
    @cached("klines", ttl=300)
    async def get_klines(
        self, code: str, kl_type: str = "K_DAY", count: int = 250
    ) -> KlineData:
        quote_ctx = futu_client.get_quote_ctx()

        from futu import KLType

        kltype = getattr(KLType, kl_type, KLType.K_DAY)
        ret, data, _ = await futu_client._run_sync(
            quote_ctx.request_history_kline, code, ktype=kltype, max_count=count
        )
        if ret != 0:
            from app.core.exceptions import FutuOpenDError

            raise FutuOpenDError(ret, str(data))

        bars = []
        for _, row in data.iterrows():
            bars.append(
                KlineBar(
                    time=str(row["time_key"]),
                    open=float(row["open"]),
                    high=float(row["high"]),
                    low=float(row["low"]),
                    close=float(row["close"]),
                    volume=float(row["volume"]),
                )
            )

        return KlineData(code=code, kl_type=kl_type, bars=bars)

    @cached("indicators", ttl=300)
    async def get_indicators(
        self, code: str, kl_type: str = "K_DAY", count: int = 250
    ) -> IndicatorSet:
        kline_data = await self.get_klines(code, kl_type, count)
        df = pd.DataFrame([b.model_dump() for b in kline_data.bars])
        indicators = compute_indicators(df)
        return IndicatorSet(**indicators)

    @cached("sr_levels", ttl=300)
    async def get_sr_levels(
        self, code: str, kl_type: str = "K_DAY", count: int = 250
    ) -> SrLevelsResponse:
        kline_data = await self.get_klines(code, kl_type, count)
        df = pd.DataFrame([b.model_dump() for b in kline_data.bars])
        levels = detect_support_resistance(df)

        return SrLevelsResponse(
            supports=[
                SRLevel(level=s["level"], type="support", strength=s["strength"])
                for s in levels["supports"]
            ],
            resistances=[
                SRLevel(level=r["level"], type="resistance", strength=r["strength"])
                for r in levels["resistances"]
            ],
        )

    async def search_stock(self, query: str) -> list[StockInfo]:
        quote_ctx = futu_client.get_quote_ctx()
        results: list[StockInfo] = []

        from app.utils.market_utils import get_default_markets

        markets = get_default_markets()
        for market in markets:
            try:
                from futu import SecurityType

                ret, data = await futu_client._run_sync(
                    quote_ctx.get_stock_basicinfo,
                    market,
                    SecurityType.STOCK,
                )
                if ret != 0:
                    continue

                q = query.upper()
                filtered = data[
                    data["code"].str.upper().str.contains(q)
                    | data["name"].str.upper().str.contains(q)
                ]
                for _, row in filtered.head(10).iterrows():
                    results.append(
                        StockInfo(
                            code=row["code"],
                            name=row["name"],
                            market=market,
                        )
                    )
            except Exception:
                continue

        return results[:20]

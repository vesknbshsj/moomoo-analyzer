import logging
import math

from app.core.cache import cached
from app.core.futu_client import futu_client
from app.models.portfolio import PortfolioSummary, Position, SectorBreakdown
from app.utils.market_utils import get_default_markets, parse_stock_code

logger = logging.getLogger(__name__)


def _num(value, fallback=0.0):
    """Return value as float, or fallback if value is None/NaN/Inf."""
    if value is None:
        return fallback
    try:
        f = float(value)
        if math.isnan(f) or math.isinf(f):
            return fallback
        return f
    except (ValueError, TypeError):
        return fallback


class PortfolioService:
    @cached("portfolio", ttl=30)
    async def get_positions(self) -> list[Position]:
        """Fetch positions across all configured markets."""
        all_positions: dict[str, Position] = {}
        markets = get_default_markets()

        for market in markets:
            try:
                trade_ctx = futu_client.get_trade_ctx(market)
                ret, data = await futu_client._run_sync(
                    trade_ctx.position_list_query
                )
                if ret != 0:
                    logger.warning(f"Failed to get positions for {market}: {data}")
                    continue

                if data.empty:
                    continue

                quote_ctx = futu_client.get_quote_ctx()
                codes = data["code"].tolist()
                snap_ret, snap_data = await futu_client._run_sync(
                    quote_ctx.get_market_snapshot, codes
                )
                snap_map = {}
                if snap_ret == 0 and not snap_data.empty:
                    for _, row in snap_data.iterrows():
                        snap_map[row["code"]] = row

                for _, row in data.iterrows():
                    code = row["code"]
                    snap = snap_map.get(code)

                    # Current price: snapshot last_price > position nominal_price > cost_price
                    qty = _num(row.get("qty"))
                    cost_price = _num(row.get("cost_price"))

                    current_price = _num(
                        snap["last_price"] if snap is not None else None,
                        fallback=_num(row.get("nominal_price"), fallback=cost_price),
                    )

                    # P&L already computed by Futu API — use directly when available
                    pl_val = _num(row.get("pl_val"), fallback=None)
                    pl_ratio = _num(row.get("pl_ratio"), fallback=None)
                    market_val = _num(row.get("market_val"), fallback=None)

                    if pl_val is None or market_val is None:
                        market_val = qty * current_price
                        pl_val = market_val - cost_price * qty

                    if pl_ratio is None:
                        cost_basis = cost_price * qty
                        pl_ratio = (pl_val / cost_basis * 100) if cost_basis else 0

                    prev_close = _num(
                        snap["prev_close_price"] if snap is not None else None,
                        fallback=current_price,
                    )
                    day_change = (current_price - prev_close) * qty

                    market_code, symbol = parse_stock_code(code)
                    currency_map = {"HK": "HKD", "US": "USD", "CN": "CNH"}
                    currency = currency_map.get(market_code, "USD")

                    all_positions[code] = Position(
                            code=code,
                            stock_name=row.get("stock_name", symbol),
                            market=market_code,
                            qty=qty,
                            cost_price=cost_price,
                            current_price=current_price,
                            market_val=market_val,
                            pl_val=pl_val,
                            pl_ratio=pl_ratio,
                            day_change=day_change,
                            day_change_ratio=(
                                (day_change / (market_val - day_change) * 100)
                                if market_val - day_change else 0
                            ),
                            currency=currency,
                        )
            except Exception as e:
                logger.warning(f"Error fetching positions for market {market}: {e}")
                continue

        return list(all_positions.values())

    async def get_summary(self) -> PortfolioSummary:
        positions = await self.get_positions()
        if not positions:
            return PortfolioSummary(
                total_market_value=0,
                total_cost=0,
                total_pl_val=0,
                total_pl_ratio=0,
                total_day_change=0,
                position_count=0,
                currency_breakdown={},
                diversification_score=0,
                top_holding_concentration=0,
            )

        total_market_val = sum(p.market_val for p in positions)
        total_cost = sum(p.cost_price * p.qty for p in positions)
        total_pl = total_market_val - total_cost
        total_pl_ratio = (total_pl / total_cost * 100) if total_cost else 0
        total_day_change = sum(p.day_change for p in positions)
        position_count = len(positions)

        # Currency breakdown
        currency_breakdown: dict[str, float] = {}
        for p in positions:
            currency_breakdown[p.currency] = (
                currency_breakdown.get(p.currency, 0) + p.market_val
            )

        # Concentration: % in largest holding
        max_val = max((p.market_val for p in positions), default=0)
        concentration = (max_val / total_market_val * 100) if total_market_val else 0

        # Diversification: inverse of Herfindahl-Hirschman Index normalized
        hhi = sum((p.market_val / total_market_val) ** 2 for p in positions) if total_market_val else 1
        div_score = max(0, min(100, int((1 - hhi) * 100)))

        return PortfolioSummary(
            total_market_value=total_market_val,
            total_cost=total_cost,
            total_pl_val=total_pl,
            total_pl_ratio=total_pl_ratio,
            total_day_change=total_day_change,
            position_count=position_count,
            currency_breakdown=currency_breakdown,
            diversification_score=div_score,
            top_holding_concentration=concentration,
        )

    async def get_position(self, code: str) -> Position:
        positions = await self.get_positions()
        for p in positions:
            if p.code == code:
                return p
        from app.core.exceptions import InvalidStockCodeError

        raise InvalidStockCodeError()

    async def get_sector_breakdown(self) -> list[SectorBreakdown]:
        positions = await self.get_positions()
        sectors: dict[str, dict] = {}
        total_val = sum(p.market_val for p in positions)

        for p in positions:
            sector = p.sector or "未分类 / Unclassified"
            if sector not in sectors:
                sectors[sector] = {"market_value": 0, "positions": []}
            sectors[sector]["market_value"] += p.market_val
            sectors[sector]["positions"].append(p.code)

        return [
            SectorBreakdown(
                sector=s,
                weight_pct=v["market_value"] / total_val * 100 if total_val else 0,
                market_value=v["market_value"],
                positions=v["positions"],
            )
            for s, v in sorted(
                sectors.items(), key=lambda x: x[1]["market_value"], reverse=True
            )
        ]

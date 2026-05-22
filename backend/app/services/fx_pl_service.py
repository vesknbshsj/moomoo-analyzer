import logging
from datetime import date

from app.core.cache import cached
from app.core.futu_client import futu_client
from app.models.fx_pl import CurrencyExposure, FxPlBreakdown, FxPlSummary
from app.services.portfolio_service import PortfolioService
from app.utils.fx_rates import fx_provider
from app.utils.market_utils import get_market_currency

logger = logging.getLogger(__name__)


class FxPlService:
    def __init__(self):
        self._portfolio_service = PortfolioService()

    @cached("fx_pl_summary", ttl=30)
    async def get_summary(self, base_currency: str = "CNH") -> FxPlSummary:
        positions = await self._portfolio_service.get_positions()
        breakdowns: list[FxPlBreakdown] = []

        for p in positions:
            trade_currency = p.currency
            if trade_currency == base_currency:
                # No FX exposure
                breakdowns.append(
                    FxPlBreakdown(
                        code=p.code,
                        stock_name=p.stock_name,
                        trade_currency=trade_currency,
                        base_currency=base_currency,
                        total_pl_base=p.pl_val,
                        stock_pl_base=p.pl_val,
                        fx_pl_base=0.0,
                        cost_at_purchase=p.cost_price * p.qty,
                        cost_at_current=p.market_val,
                        fx_rate_buy=1.0,
                        fx_rate_current=1.0,
                        hold_period_days=0,
                    )
                )
                continue

            try:
                breakdown = await self._compute_fx_breakdown(p, base_currency)
                breakdowns.append(breakdown)
            except Exception as e:
                logger.warning(f"Failed FX breakdown for {p.code}: {e}")
                breakdowns.append(
                    FxPlBreakdown(
                        code=p.code,
                        stock_name=p.stock_name,
                        trade_currency=trade_currency,
                        base_currency=base_currency,
                        total_pl_base=p.pl_val,
                        stock_pl_base=p.pl_val,
                        fx_pl_base=0.0,
                        cost_at_purchase=p.cost_price * p.qty,
                        cost_at_current=p.market_val,
                        fx_rate_buy=1.0,
                        fx_rate_current=1.0,
                        hold_period_days=0,
                    )
                )

        total_pl = sum(b.total_pl_base for b in breakdowns)
        total_stock_pl = sum(b.stock_pl_base for b in breakdowns)
        total_fx_pl = sum(b.fx_pl_base for b in breakdowns)
        fx_impact_ratio = abs(total_fx_pl / (abs(total_pl) + 0.01))
        positions_with_fx = sum(1 for b in breakdowns if abs(b.fx_pl_base) > 0.01)

        return FxPlSummary(
            total_pl_base=total_pl,
            total_stock_pl=total_stock_pl,
            total_fx_pl=total_fx_pl,
            fx_impact_ratio=fx_impact_ratio,
            positions_with_fx_impact=positions_with_fx,
            breakdowns=breakdowns,
        )

    async def get_currency_exposure(self, base_currency: str = "CNH") -> list[CurrencyExposure]:
        positions = await self._portfolio_service.get_positions()
        total_val = sum(p.market_val for p in positions)

        exposure_map: dict[str, dict] = {}
        for p in positions:
            cur = p.currency
            if cur not in exposure_map:
                exposure_map[cur] = {
                    "market_value_in_base": 0,
                    "position_count": 0,
                    "unrealized_fx_pl": 0,
                }
            # Convert to base currency at current rate
            try:
                rate = await fx_provider.get_rate(cur, base_currency)
            except Exception:
                rate = 1.0
            exposure_map[cur]["market_value_in_base"] += p.market_val * rate
            exposure_map[cur]["position_count"] += 1

        return [
            CurrencyExposure(
                currency=cur,
                market_value_in_base=v["market_value_in_base"],
                weight_pct=v["market_value_in_base"] / (total_val or 1) * 100,
                unrealized_fx_pl=v["unrealized_fx_pl"],
                position_count=v["position_count"],
            )
            for cur, v in sorted(
                exposure_map.items(),
                key=lambda x: x[1]["market_value_in_base"],
                reverse=True,
            )
        ]

    async def _compute_fx_breakdown(self, p, base_currency: str) -> FxPlBreakdown:
        trade_currency = p.currency
        current_rate = await fx_provider.get_rate(trade_currency, base_currency)

        # Approximate purchase FX rate using average cost
        # In production, use history_deal_list_query for exact dates
        purchase_rate = current_rate
        hold_days = 0

        try:
            trade_ctx = futu_client.get_trade_ctx(p.market)
            ret, data = await futu_client._run_sync(
                trade_ctx.history_deal_list_query
            )
            if ret == 0 and not data.empty:
                # Filter deals for this stock
                stock_deals = data[data["code"] == p.code]
                if not stock_deals.empty:
                    earliest = stock_deals["create_time"].min()
                    purchase_date = earliest.date() if hasattr(earliest, "date") else date.today()
                    try:
                        purchase_rate = await fx_provider.get_historical_rate(
                            trade_currency, base_currency, purchase_date
                        )
                    except Exception:
                        purchase_rate = current_rate
                    hold_days = (date.today() - purchase_date).days
        except Exception:
            pass

        cost_trade = p.cost_price * p.qty
        cost_at_purchase_base = cost_trade * purchase_rate
        cost_at_current_base = p.market_val * current_rate
        total_pl_base = cost_at_current_base - cost_at_purchase_base

        # Stock-only P&L: what if FX rate hadn't changed?
        current_val_fixed_fx = p.market_val * purchase_rate
        stock_pl_base = current_val_fixed_fx - cost_at_purchase_base
        fx_pl_base = total_pl_base - stock_pl_base

        return FxPlBreakdown(
            code=p.code,
            stock_name=p.stock_name,
            trade_currency=trade_currency,
            base_currency=base_currency,
            total_pl_base=total_pl_base,
            stock_pl_base=stock_pl_base,
            fx_pl_base=fx_pl_base,
            cost_at_purchase=cost_at_purchase_base,
            cost_at_current=cost_at_current_base,
            fx_rate_buy=purchase_rate,
            fx_rate_current=current_rate,
            hold_period_days=hold_days,
        )

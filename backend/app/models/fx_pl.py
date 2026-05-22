from pydantic import BaseModel


class FxPlBreakdown(BaseModel):
    code: str
    stock_name: str
    trade_currency: str
    base_currency: str
    total_pl_base: float
    stock_pl_base: float
    fx_pl_base: float
    cost_at_purchase: float
    cost_at_current: float
    fx_rate_buy: float
    fx_rate_current: float
    hold_period_days: int


class FxPlSummary(BaseModel):
    total_pl_base: float
    total_stock_pl: float
    total_fx_pl: float
    fx_impact_ratio: float
    positions_with_fx_impact: int
    breakdowns: list[FxPlBreakdown]


class CurrencyExposure(BaseModel):
    currency: str
    market_value_in_base: float
    weight_pct: float
    unrealized_fx_pl: float
    position_count: int

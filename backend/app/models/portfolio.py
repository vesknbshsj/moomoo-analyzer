from typing import Optional

from pydantic import BaseModel


class Position(BaseModel):
    code: str
    stock_name: str
    market: str
    qty: float
    cost_price: float
    current_price: float
    market_val: float
    pl_val: float
    pl_ratio: float
    day_change: float
    day_change_ratio: float
    currency: str
    sector: Optional[str] = None


class PortfolioSummary(BaseModel):
    total_market_value: float
    total_cost: float
    total_pl_val: float
    total_pl_ratio: float
    total_day_change: float
    position_count: int
    currency_breakdown: dict[str, float]
    diversification_score: int
    top_holding_concentration: float


class SectorBreakdown(BaseModel):
    sector: str
    weight_pct: float
    market_value: float
    positions: list[str]

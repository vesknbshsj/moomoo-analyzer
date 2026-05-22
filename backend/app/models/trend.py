from typing import Optional

from pydantic import BaseModel


class KlineBar(BaseModel):
    time: str
    open: float
    high: float
    low: float
    close: float
    volume: float


class KlineData(BaseModel):
    code: str
    kl_type: str
    bars: list[KlineBar]


class IndicatorSet(BaseModel):
    ma_5: list[Optional[float]]
    ma_20: list[Optional[float]]
    ma_60: list[Optional[float]]
    ma_200: list[Optional[float]]
    macd_line: list[Optional[float]]
    macd_signal: list[Optional[float]]
    macd_histogram: list[Optional[float]]
    rsi_14: list[Optional[float]]
    bollinger_upper: list[Optional[float]]
    bollinger_mid: list[Optional[float]]
    bollinger_lower: list[Optional[float]]


class SRLevel(BaseModel):
    level: float
    type: str  # "support" or "resistance"
    strength: int


class SrLevelsResponse(BaseModel):
    supports: list[SRLevel]
    resistances: list[SRLevel]


class StockInfo(BaseModel):
    code: str
    name: str
    market: str

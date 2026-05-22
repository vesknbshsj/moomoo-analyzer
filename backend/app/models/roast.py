from datetime import datetime

from pydantic import BaseModel


class RoastMetric(BaseModel):
    label: str
    value: str
    verdict: str
    commentary: str


class RoastEntry(BaseModel):
    code: str
    stock_name: str
    position_weight_pct: float
    pl_ratio: float
    roast_comment: str


class RoastSummary(BaseModel):
    overall_score: int
    overall_verdict: str
    intro_text: str
    metrics: list[RoastMetric]
    positions_roasted: list[RoastEntry]
    generated_at: datetime

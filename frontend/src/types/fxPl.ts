export interface FxPlBreakdown {
  code: string
  stock_name: string
  trade_currency: string
  base_currency: string
  total_pl_base: number
  stock_pl_base: number
  fx_pl_base: number
  cost_at_purchase: number
  cost_at_current: number
  fx_rate_buy: number
  fx_rate_current: number
  hold_period_days: number
}

export interface FxPlSummary {
  total_pl_base: number
  total_stock_pl: number
  total_fx_pl: number
  fx_impact_ratio: number
  positions_with_fx_impact: number
  breakdowns: FxPlBreakdown[]
}

export interface CurrencyExposure {
  currency: string
  market_value_in_base: number
  weight_pct: number
  unrealized_fx_pl: number
  position_count: number
}

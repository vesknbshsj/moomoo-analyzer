export interface Position {
  code: string
  stock_name: string
  market: string
  qty: number
  cost_price: number
  current_price: number
  market_val: number
  pl_val: number
  pl_ratio: number
  day_change: number
  day_change_ratio: number
  currency: string
  sector: string | null
}

export interface PortfolioSummary {
  total_market_value: number
  total_cost: number
  total_pl_val: number
  total_pl_ratio: number
  total_day_change: number
  position_count: number
  currency_breakdown: Record<string, number>
  diversification_score: number
  top_holding_concentration: number
}

export interface SectorBreakdown {
  sector: string
  weight_pct: number
  market_value: number
  positions: string[]
}

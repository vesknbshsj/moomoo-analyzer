export interface RoastMetric {
  label: string
  value: string
  verdict: string
  commentary: string
}

export interface RoastEntry {
  code: string
  stock_name: string
  position_weight_pct: number
  pl_ratio: number
  roast_comment: string
}

export interface RoastSummary {
  overall_score: number
  overall_verdict: string
  intro_text: string
  metrics: RoastMetric[]
  positions_roasted: RoastEntry[]
  generated_at: string
}

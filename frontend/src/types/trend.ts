export interface KlineBar {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface KlineData {
  code: string
  kl_type: string
  bars: KlineBar[]
}

export interface IndicatorSet {
  ma_5: (number | null)[]
  ma_20: (number | null)[]
  ma_60: (number | null)[]
  ma_200: (number | null)[]
  macd_line: (number | null)[]
  macd_signal: (number | null)[]
  macd_histogram: (number | null)[]
  rsi_14: (number | null)[]
  bollinger_upper: (number | null)[]
  bollinger_mid: (number | null)[]
  bollinger_lower: (number | null)[]
}

export interface SRLevel {
  level: number
  type: 'support' | 'resistance'
  strength: number
}

export interface SrLevelsResponse {
  supports: SRLevel[]
  resistances: SRLevel[]
}

export interface StockInfo {
  code: string
  name: string
  market: string
}

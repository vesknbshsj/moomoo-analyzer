import type { DeepPartial, ChartOptions } from 'lightweight-charts'

export const chartOptions: DeepPartial<ChartOptions> = {
  layout: {
    background: { color: '#ffffff' },
    textColor: '#334155',
  },
  grid: {
    vertLines: { color: '#e2e8f0' },
    horzLines: { color: '#e2e8f0' },
  },
  crosshair: {
    mode: 0,
  },
  rightPriceScale: {
    borderColor: '#cbd5e1',
  },
  timeScale: {
    borderColor: '#cbd5e1',
    timeVisible: true,
    secondsVisible: false,
  },
}

export const candleColors = {
  up: '#22c55e',
  down: '#ef4444',
  wick: '#64748b',
}

export const maColors: Record<string, string> = {
  ma5: '#f59e0b',
  ma20: '#3b82f6',
  ma60: '#8b5cf6',
  ma200: '#ef4444',
}

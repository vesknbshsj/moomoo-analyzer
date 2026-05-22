const currencySymbols: Record<string, string> = {
  USD: '$',
  HKD: 'HK$',
  CNH: '¥',
  CNY: '¥',
  SGD: 'S$',
  JPY: '¥',
}

export function formatCurrency(value: number, currency: string): string {
  const symbol = currencySymbols[currency] || currency
  return `${symbol}${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export function getPlColor(value: number): string {
  if (value > 0) return 'text-up'
  if (value < 0) return 'text-down'
  return 'text-gray-500'
}

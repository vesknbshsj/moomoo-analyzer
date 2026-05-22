import type { Position } from '@/types/portfolio'
import { formatCurrency, formatPercent, getPlColor } from '@/utils/format'

interface Props {
  position: Position
}

export default function PositionCard({ position: p }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded">
              {p.market}
            </span>
            <h3 className="font-semibold text-gray-900">{p.stock_name}</h3>
          </div>
          <div className="text-xs text-gray-400 mt-1">{p.code}</div>
        </div>
        <div className="text-right">
          <div className="font-bold text-gray-900">
            {formatCurrency(p.market_val, p.currency)}
          </div>
          <div className="text-xs text-gray-400">
            {p.qty.toLocaleString()} shares
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <div className="text-gray-400 text-xs">Cost</div>
          <div className="font-medium">
            {formatCurrency(p.cost_price, p.currency)}
          </div>
        </div>
        <div>
          <div className="text-gray-400 text-xs">Current</div>
          <div className="font-medium">
            {formatCurrency(p.current_price, p.currency)}
          </div>
        </div>
        <div>
          <div className="text-gray-400 text-xs">P/L</div>
          <div className={`font-medium ${getPlColor(p.pl_ratio)}`}>
            {formatPercent(p.pl_ratio)}
          </div>
        </div>
      </div>
    </div>
  )
}

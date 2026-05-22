import type { FxPlBreakdown } from '@/types/fxPl'
import { formatCurrency, formatPercent, getPlColor } from '@/utils/format'

interface Props {
  breakdowns: FxPlBreakdown[]
}

export default function FxPlSummaryTable({ breakdowns }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-medium text-gray-600">Stock</th>
              <th className="px-4 py-3 font-medium text-gray-600">Trade CCY</th>
              <th className="px-4 py-3 font-medium text-gray-600">Total P&L</th>
              <th className="px-4 py-3 font-medium text-gray-600">Stock P&L</th>
              <th className="px-4 py-3 font-medium text-gray-600">FX P&L</th>
              <th className="px-4 py-3 font-medium text-gray-600">Buy Rate</th>
              <th className="px-4 py-3 font-medium text-gray-600">Current</th>
              <th className="px-4 py-3 font-medium text-gray-600">Days</th>
            </tr>
          </thead>
          <tbody>
            {breakdowns.map((b) => (
              <tr key={b.code} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {b.stock_name}
                  <div className="text-xs text-gray-400">{b.code}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                    {b.trade_currency}→{b.base_currency}
                  </span>
                </td>
                <td className={`px-4 py-3 font-mono font-medium ${getPlColor(b.total_pl_base)}`}>
                  {formatCurrency(b.total_pl_base, b.base_currency)}
                </td>
                <td className={`px-4 py-3 font-mono ${getPlColor(b.stock_pl_base)}`}>
                  {formatCurrency(b.stock_pl_base, b.base_currency)}
                </td>
                <td className={`px-4 py-3 font-mono ${getPlColor(b.fx_pl_base)}`}>
                  {formatCurrency(b.fx_pl_base, b.base_currency)}
                </td>
                <td className="px-4 py-3 font-mono text-gray-600">
                  {b.fx_rate_buy.toFixed(4)}
                </td>
                <td className="px-4 py-3 font-mono text-gray-600">
                  {b.fx_rate_current.toFixed(4)}
                </td>
                <td className="px-4 py-3 text-gray-500">{b.hold_period_days}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

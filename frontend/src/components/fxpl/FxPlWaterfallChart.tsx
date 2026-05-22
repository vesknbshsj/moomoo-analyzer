import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'
import type { FxPlSummary } from '@/types/fxPl'

interface Props {
  summary: FxPlSummary
}

export default function FxPlWaterfallChart({ summary }: Props) {
  const data = [
    {
      name: 'Total P&L',
      value: Math.round(summary.total_pl_base * 100) / 100,
      fill: summary.total_pl_base >= 0 ? '#22c55e' : '#ef4444',
    },
    {
      name: 'Stock P&L',
      value: Math.round(summary.total_stock_pl * 100) / 100,
      fill: summary.total_stock_pl >= 0 ? '#22c55e' : '#ef4444',
    },
    {
      name: 'FX P&L',
      value: Math.round(summary.total_fx_pl * 100) / 100,
      fill: summary.total_fx_pl >= 0 ? '#22c55e' : '#ef4444',
    },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        P&L Breakdown Waterfall
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) =>
              `${value >= 0 ? '+' : ''}${value.toLocaleString()}`
            }
            contentStyle={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
            }}
          />
          <ReferenceLine y={0} stroke="#94a3b8" />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex justify-center gap-6 text-sm">
        <div>
          <span className="text-gray-500">FX Impact Ratio: </span>
          <span className="font-bold">
            {(summary.fx_impact_ratio * 100).toFixed(1)}%
          </span>
        </div>
        <div>
          <span className="text-gray-500">Positions with FX exposure: </span>
          <span className="font-bold">{summary.positions_with_fx_impact}</span>
        </div>
      </div>
    </div>
  )
}

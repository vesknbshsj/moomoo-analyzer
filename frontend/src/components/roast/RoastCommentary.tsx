import type { RoastMetric, RoastEntry } from '@/types/roast'
import { formatPercent, getPlColor } from '@/utils/format'

interface Props {
  intro: string
  verdict: string
  metrics: RoastMetric[]
  positions: RoastEntry[]
}

export default function RoastCommentary({ intro, verdict, metrics, positions }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-700 text-lg leading-relaxed italic">"{intro}"</p>
        <p className="text-primary-600 font-bold text-xl mt-3">{verdict}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              {m.label}
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-gray-900">{m.value}</span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  m.verdict === 'safe' || m.verdict === 'green but modest'
                    ? 'bg-green-100 text-green-700'
                    : m.verdict === 'dangerous' || m.verdict === 'brutal'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {m.verdict}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">{m.commentary}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Positions Under Fire
        </h3>
        <div className="space-y-3">
          {positions.map((p) => (
            <div key={p.code} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{p.stock_name}</span>
                  <span className="text-xs text-gray-400">
                    ({p.position_weight_pct.toFixed(1)}%)
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{p.roast_comment}</p>
              </div>
              <span className={`text-sm font-bold ${getPlColor(p.pl_ratio)}`}>
                {formatPercent(p.pl_ratio)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

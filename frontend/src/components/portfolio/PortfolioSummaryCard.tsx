import { useTranslation } from 'react-i18next'
import type { PortfolioSummary } from '@/types/portfolio'
import { formatCurrency, formatPercent, getPlColor } from '@/utils/format'

interface Props {
  summary: PortfolioSummary
}

export default function PortfolioSummaryCard({ summary }: Props) {
  const { t } = useTranslation('portfolio')

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label={t('totalValue')}
        value={formatCurrency(summary.total_market_value, 'USD')}
      />
      <StatCard
        label={t('totalPL')}
        value={formatCurrency(summary.total_pl_val, 'USD')}
        extra={formatPercent(summary.total_pl_ratio)}
        colorClass={getPlColor(summary.total_pl_val)}
      />
      <StatCard
        label={t('dayChange')}
        value={formatCurrency(summary.total_day_change, 'USD')}
        colorClass={getPlColor(summary.total_day_change)}
      />
      <StatCard
        label={t('holdings')}
        value={String(summary.position_count)}
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  extra,
  colorClass,
}: {
  label: string
  value: string
  extra?: string
  colorClass?: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className={`text-lg font-bold ${colorClass || 'text-gray-900'}`}>
        {value}
      </div>
      {extra && (
        <div className={`text-sm font-medium mt-1 ${colorClass || ''}`}>
          {extra}
        </div>
      )}
    </div>
  )
}

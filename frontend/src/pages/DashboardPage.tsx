import { useTranslation } from 'react-i18next'
import { usePortfolio } from '@/hooks/usePortfolio'
import PortfolioSummaryCard from '@/components/portfolio/PortfolioSummaryCard'
import PositionCard from '@/components/portfolio/PositionCard'
import { useQuery } from '@tanstack/react-query'
import { portfolioApi } from '@/api/portfolioApi'
import SectorBreakdown from '@/components/portfolio/SectorBreakdown'
import { useConnectionStore } from '@/store/connectionStore'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { t } = useTranslation('portfolio')
  const { positions, summary, isLoading } = usePortfolio()
  const isConnected = useConnectionStore((s) => s.isConnected)

  const sectorsQuery = useQuery({
    queryKey: ['portfolio', 'sectors'],
    queryFn: portfolioApi.getSectors,
    enabled: isConnected(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('title')}</h1>

      {summary && <PortfolioSummaryCard summary={summary} />}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {t('positions')} ({positions.length})
          </h2>
          {positions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
              {t('noPositions')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {positions.map((p) => (
                <PositionCard key={p.code} position={p} />
              ))}
            </div>
          )}
        </div>

        <div>
          {sectorsQuery.data && sectorsQuery.data.length > 0 && (
            <SectorBreakdown sectors={sectorsQuery.data} />
          )}
          {summary && summary.diversification_score !== undefined && (
            <div className="bg-white rounded-xl shadow-sm p-6 mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                {t('diversification')}
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-500 h-3 rounded-full transition-all"
                    style={{ width: `${summary.diversification_score}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {summary.diversification_score}/100
                </span>
              </div>
              <div className="mt-3 text-sm text-gray-500">
                {t('concentration')}: {summary.top_holding_concentration.toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

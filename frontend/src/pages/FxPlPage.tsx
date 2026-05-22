import { useTranslation } from 'react-i18next'
import { useFxPl } from '@/hooks/useFxPl'
import FxPlWaterfallChart from '@/components/fxpl/FxPlWaterfallChart'
import FxPlSummaryTable from '@/components/fxpl/FxPlSummaryTable'
import CurrencyExposurePie from '@/components/fxpl/CurrencyExposurePie'
import { Loader2 } from 'lucide-react'

export default function FxPlPage() {
  const { t } = useTranslation('fxPl')
  const { summary, exposure, isLoading } = useFxPl()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="text-center py-12 text-gray-400">{t('noFxExposure')}</div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h1>
      <p className="text-gray-500 mb-6">{t('subtitle')}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <FxPlWaterfallChart summary={summary} />
        <CurrencyExposurePie exposures={exposure} />
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('perPosition')}
      </h2>
      <FxPlSummaryTable breakdowns={summary.breakdowns} />
    </div>
  )
}

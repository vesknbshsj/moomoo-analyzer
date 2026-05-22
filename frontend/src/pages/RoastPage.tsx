import { useTranslation } from 'react-i18next'
import { useRoast } from '@/hooks/useRoast'
import RoastScoreGauge from '@/components/roast/RoastScoreGauge'
import RoastCommentary from '@/components/roast/RoastCommentary'
import { useRef } from 'react'
import { Loader2, RefreshCw, Share2 } from 'lucide-react'
import html2canvas from 'html2canvas'

export default function RoastPage() {
  const { t } = useTranslation('roast')
  const { roast, isLoading, regenerate, isRegenerating } = useRoast()
  const cardRef = useRef<HTMLDivElement>(null)

  const handleShare = async () => {
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: '#ffffff',
      scale: 2,
    })
    const link = document.createElement('a')
    link.download = `roast-${new Date().toISOString().slice(0, 10)}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    )
  }

  if (!roast) {
    return (
      <div className="text-center py-12 text-gray-400">
        Unable to generate roast. Make sure you have positions in your account.
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => regenerate()}
            disabled={isRegenerating}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={isRegenerating ? 'animate-spin' : ''}
            />
            {t('regenerate')}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Share2 size={16} />
            {t('shareImage')}
          </button>
        </div>
      </div>

      <div ref={cardRef} className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
          <RoastScoreGauge score={roast.overall_score} />
          <div className="flex-1">
            <RoastCommentary
              intro={roast.intro_text}
              verdict={roast.overall_verdict}
              metrics={roast.metrics}
              positions={roast.positions_roasted}
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        {t('generatedAt')}: {new Date(roast.generated_at).toLocaleString()}
      </p>
    </div>
  )
}

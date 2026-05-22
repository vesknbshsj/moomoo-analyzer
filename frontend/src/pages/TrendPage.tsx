import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTrend } from '@/hooks/useTrend'
import KlineChart from '@/components/trend/KlineChart'
import IndicatorPanel from '@/components/trend/IndicatorPanel'
import StockSymbolSearch from '@/components/trend/StockSymbolSearch'
import TimeframeSelector from '@/components/trend/TimeframeSelector'
import { Loader2, BarChart3 } from 'lucide-react'
import type { StockInfo } from '@/types/trend'

export default function TrendPage() {
  const { t } = useTranslation('trend')
  const { code } = useParams<{ code?: string }>()
  const navigate = useNavigate()
  const [stockCode, setStockCode] = useState(code || '')
  const [stockName, setStockName] = useState('')
  const [klType, setKlType] = useState('K_DAY')
  const [count, setCount] = useState(250)

  const { klines, indicators, srLevels, isLoading } = useTrend(stockCode, klType, count)

  const handleSelectStock = (stock: StockInfo) => {
    setStockCode(stock.code)
    setStockName(stock.name)
    navigate(`/trend/${encodeURIComponent(stock.code)}`, { replace: true })
  }

  const handleTimeframeChange = (type: string, cnt: number) => {
    setKlType(type)
    setCount(cnt)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('title')}</h1>

      <div className="mb-6">
        <StockSymbolSearch onSelect={handleSelectStock} selectedCode={stockCode} />
      </div>

      {!stockCode ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400">{t('noStockSelected')}</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary-500" size={32} />
        </div>
      ) : klines && indicators && srLevels ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {stockName} <span className="text-sm text-gray-400 font-normal">{stockCode}</span>
              </h2>
            </div>
            <TimeframeSelector
              selected={klType}
              onSelect={handleTimeframeChange}
            />
          </div>

          <KlineChart klines={klines} indicators={indicators} srLevels={srLevels} />
          <IndicatorPanel klines={klines} indicators={indicators} />

          {/* SR Level annotations */}
          {srLevels.supports.length > 0 && (
            <div className="mt-4 p-4 bg-white rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-up inline-block" />
                {t('support')}
              </h3>
              <div className="flex gap-4">
                {srLevels.supports.map((s, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-mono text-up font-medium">
                      {s.level.toFixed(2)}
                    </span>
                    <span className="text-gray-400 ml-1">
                      {t('strength')}: {s.strength}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {srLevels.resistances.length > 0 && (
            <div className="mt-2 p-4 bg-white rounded-xl shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-down inline-block" />
                {t('resistance')}
              </h3>
              <div className="flex gap-4">
                {srLevels.resistances.map((r, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-mono text-down font-medium">
                      {r.level.toFixed(2)}
                    </span>
                    <span className="text-gray-400 ml-1">
                      {t('strength')}: {r.strength}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          Failed to load chart data.
        </div>
      )}
    </div>
  )
}

import { useEffect, useRef } from 'react'
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type HistogramData,
  type LineData,
  type Time,
} from 'lightweight-charts'
import type { KlineData, IndicatorSet, SrLevelsResponse } from '@/types/trend'
import { chartOptions, candleColors, maColors } from '@/utils/chartTheme'

interface Props {
  klines: KlineData
  indicators: IndicatorSet
  srLevels: SrLevelsResponse
}

export default function KlineChart({ klines, indicators, srLevels }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!containerRef.current || !klines.bars.length) return

    // Clean up previous chart
    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
    }

    const container = containerRef.current
    const chart = createChart(container, {
      ...chartOptions,
      width: container.clientWidth,
      height: 500,
    })
    chartRef.current = chart

    // Candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: candleColors.up,
      downColor: candleColors.down,
      borderUpColor: candleColors.up,
      borderDownColor: candleColors.down,
      wickUpColor: candleColors.wick,
      wickDownColor: candleColors.wick,
    })

    const candleData: CandlestickData[] = klines.bars.map((bar) => ({
      time: (bar.time.length === 10 ? bar.time : bar.time.slice(0, 10)) as Time,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
    }))
    candleSeries.setData(candleData)

    // Volume histogram
    const volumeSeries = chart.addHistogramSeries({
      color: '#3b82f633',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    })
    const volumeData: HistogramData[] = klines.bars.map((bar) => ({
      time: (bar.time.length === 10 ? bar.time : bar.time.slice(0, 10)) as Time,
      value: bar.volume,
      color: bar.close >= bar.open ? '#22c55e44' : '#ef444444',
    }))
    volumeSeries.setData(volumeData)

    // MA overlays
    const maConfigs: { key: string; color: string }[] = [
      { key: 'ma_5', color: maColors.ma5 },
      { key: 'ma_20', color: maColors.ma20 },
      { key: 'ma_60', color: maColors.ma60 },
      { key: 'ma_200', color: maColors.ma200 },
    ]

    maConfigs.forEach(({ key, color }) => {
      const data = indicators[key as keyof IndicatorSet] as (number | null)[]
      if (!data) return
      const lineData: LineData[] = data
        .map((v, i) => {
          if (v === null || v === undefined) return null
          return {
            time: (klines.bars[i].time.length === 10
              ? klines.bars[i].time
              : klines.bars[i].time.slice(0, 10)) as Time,
            value: v,
          }
        })
        .filter(Boolean) as LineData[]
      if (lineData.length > 0) {
        const lineSeries = chart.addLineSeries({
          color,
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        })
        lineSeries.setData(lineData)
      }
    })

    // Support/Resistance lines
    const currentPrice = klines.bars[klines.bars.length - 1]?.close || 0
    srLevels.supports.forEach((s) => {
      if (s.level <= currentPrice) {
        const srSeries = chart.addLineSeries({
          color: '#22c55e',
          lineWidth: 1,
          lineStyle: 2,
          priceLineVisible: false,
          lastValueVisible: false,
        })
        srSeries.setData([
          { time: candleData[0].time, value: s.level },
          { time: candleData[candleData.length - 1].time, value: s.level },
        ])
      }
    })

    srLevels.resistances.forEach((r) => {
      if (r.level >= currentPrice) {
        const srSeries = chart.addLineSeries({
          color: '#ef4444',
          lineWidth: 1,
          lineStyle: 2,
          priceLineVisible: false,
          lastValueVisible: false,
        })
        srSeries.setData([
          { time: candleData[0].time, value: r.level },
          { time: candleData[candleData.length - 1].time, value: r.level },
        ])
      }
    })

    // Resize handler
    const handleResize = () => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [klines, indicators, srLevels])

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    />
  )
}

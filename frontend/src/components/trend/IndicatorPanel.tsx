import { useEffect, useRef } from 'react'
import {
  createChart,
  type IChartApi,
  type Time,
} from 'lightweight-charts'
import type { IndicatorSet, KlineData } from '@/types/trend'
import { chartOptions } from '@/utils/chartTheme'

interface Props {
  klines: KlineData
  indicators: IndicatorSet
}

export default function IndicatorPanel({ klines, indicators }: Props) {
  const macdRef = useRef<HTMLDivElement>(null)
  const rsiRef = useRef<HTMLDivElement>(null)
  const macdChartRef = useRef<IChartApi | null>(null)
  const rsiChartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!macdRef.current || !rsiRef.current || !klines.bars.length) return

    // Cleanup
    if (macdChartRef.current) macdChartRef.current.remove()
    if (rsiChartRef.current) rsiChartRef.current.remove()

    const times = klines.bars.map((bar) =>
      (bar.time.length === 10 ? bar.time : bar.time.slice(0, 10)) as Time,
    )

    // MACD pane
    const macdChart = createChart(macdRef.current, {
      ...chartOptions,
      width: macdRef.current.clientWidth,
      height: 150,
    })
    macdChartRef.current = macdChart
    macdChart.timeScale().applyOptions({ visible: false })

    const macdHist = macdChart.addHistogramSeries({ color: '#3b82f6' })
    const histData = indicators.macd_histogram
      .map((v, i) => (v != null ? { time: times[i], value: v } : null))
      .filter(Boolean) as { time: Time; value: number }[]
    macdHist.setData(histData)

    const macdLine = macdChart.addLineSeries({
      color: '#f59e0b',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    })
    const lineData = indicators.macd_line
      .map((v, i) => (v != null ? { time: times[i], value: v } : null))
      .filter(Boolean) as { time: Time; value: number }[]
    macdLine.setData(lineData)

    const macdSig = macdChart.addLineSeries({
      color: '#ef4444',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    })
    const sigData = indicators.macd_signal
      .map((v, i) => (v != null ? { time: times[i], value: v } : null))
      .filter(Boolean) as { time: Time; value: number }[]
    macdSig.setData(sigData)

    // RSI pane
    const rsiChart = createChart(rsiRef.current, {
      ...chartOptions,
      width: rsiRef.current.clientWidth,
      height: 150,
    })
    rsiChartRef.current = rsiChart

    const rsiLine = rsiChart.addLineSeries({
      color: '#8b5cf6',
      lineWidth: 2,
    })
    const rsiData = indicators.rsi_14
      .map((v, i) => (v != null ? { time: times[i], value: v } : null))
      .filter(Boolean) as { time: Time; value: number }[]
    rsiLine.setData(rsiData)

    // RSI bands at 70/30
    const overbought = rsiChart.addLineSeries({
      color: '#ef444444',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    })
    overbought.setData([
      { time: times[0], value: 70 },
      { time: times[times.length - 1], value: 70 },
    ])

    const oversold = rsiChart.addLineSeries({
      color: '#22c55e44',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    })
    oversold.setData([
      { time: times[0], value: 30 },
      { time: times[times.length - 1], value: 30 },
    ])

    return () => {
      if (macdChartRef.current) macdChartRef.current.remove()
      if (rsiChartRef.current) rsiChartRef.current.remove()
    }
  }, [klines, indicators])

  return (
    <div>
      <div ref={macdRef} className="bg-white border-t border-gray-100" />
      <div ref={rsiRef} className="bg-white border-t border-gray-100" />
    </div>
  )
}

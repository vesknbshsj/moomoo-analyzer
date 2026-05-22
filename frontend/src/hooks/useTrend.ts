import { useQuery } from '@tanstack/react-query'
import { trendApi } from '@/api/trendApi'
import { useConnectionStore } from '@/store/connectionStore'

export function useTrend(code: string, klType = 'K_DAY', count = 250) {
  const isConnected = useConnectionStore((s) => s.isConnected)

  const klinesQuery = useQuery({
    queryKey: ['trend', 'klines', code, klType, count],
    queryFn: () => trendApi.getKlines(code, klType, count),
    staleTime: 300_000,
    enabled: isConnected() && !!code,
  })

  const indicatorsQuery = useQuery({
    queryKey: ['trend', 'indicators', code, klType, count],
    queryFn: () => trendApi.getIndicators(code, klType, count),
    staleTime: 300_000,
    enabled: isConnected() && !!code,
  })

  const srLevelsQuery = useQuery({
    queryKey: ['trend', 'sr-levels', code, klType, count],
    queryFn: () => trendApi.getSrLevels(code, klType, count),
    staleTime: 300_000,
    enabled: isConnected() && !!code,
  })

  return {
    klines: klinesQuery.data,
    indicators: indicatorsQuery.data,
    srLevels: srLevelsQuery.data,
    isLoading: klinesQuery.isLoading || indicatorsQuery.isLoading,
    error: klinesQuery.error || indicatorsQuery.error,
  }
}

export function useStockSearch(query: string) {
  const isConnected = useConnectionStore((s) => s.isConnected)

  return useQuery({
    queryKey: ['trend', 'search', query],
    queryFn: () => trendApi.search(query),
    staleTime: 60_000,
    enabled: isConnected() && query.length >= 2,
  })
}

import { useQuery } from '@tanstack/react-query'
import { fxPlApi } from '@/api/fxPlApi'
import { useConnectionStore } from '@/store/connectionStore'

export function useFxPl(baseCurrency = 'CNH') {
  const isConnected = useConnectionStore((s) => s.isConnected)

  const summaryQuery = useQuery({
    queryKey: ['fxPl', 'summary', baseCurrency],
    queryFn: () => fxPlApi.getSummary(baseCurrency),
    staleTime: 30_000,
    enabled: isConnected(),
  })

  const exposureQuery = useQuery({
    queryKey: ['fxPl', 'exposure', baseCurrency],
    queryFn: () => fxPlApi.getExposure(baseCurrency),
    staleTime: 30_000,
    enabled: isConnected(),
  })

  return {
    summary: summaryQuery.data,
    exposure: exposureQuery.data ?? [],
    isLoading: summaryQuery.isLoading || exposureQuery.isLoading,
    error: summaryQuery.error || exposureQuery.error,
  }
}

import { useQuery } from '@tanstack/react-query'
import { portfolioApi } from '@/api/portfolioApi'
import { useConnectionStore } from '@/store/connectionStore'

export function usePortfolio() {
  const isConnected = useConnectionStore((s) => s.isConnected)

  const positionsQuery = useQuery({
    queryKey: ['portfolio'],
    queryFn: portfolioApi.getPositions,
    refetchInterval: 60_000,
    staleTime: 30_000,
    enabled: isConnected(),
  })

  const summaryQuery = useQuery({
    queryKey: ['portfolio', 'summary'],
    queryFn: portfolioApi.getSummary,
    refetchInterval: 60_000,
    staleTime: 30_000,
    enabled: isConnected(),
  })

  return {
    positions: positionsQuery.data ?? [],
    summary: summaryQuery.data,
    isLoading: positionsQuery.isLoading || summaryQuery.isLoading,
    error: positionsQuery.error || summaryQuery.error,
  }
}

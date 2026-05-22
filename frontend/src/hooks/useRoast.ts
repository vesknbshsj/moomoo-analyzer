import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roastApi } from '@/api/roastApi'
import { useConnectionStore } from '@/store/connectionStore'

export function useRoast() {
  const queryClient = useQueryClient()
  const isConnected = useConnectionStore((s) => s.isConnected)

  const roastQuery = useQuery({
    queryKey: ['roast'],
    queryFn: roastApi.getRoast,
    staleTime: 300_000,
    enabled: isConnected(),
  })

  const regenerateMutation = useMutation({
    mutationFn: roastApi.regenerate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roast'] })
    },
  })

  return {
    roast: roastQuery.data,
    isLoading: roastQuery.isLoading,
    error: roastQuery.error,
    regenerate: regenerateMutation.mutate,
    isRegenerating: regenerateMutation.isPending,
  }
}

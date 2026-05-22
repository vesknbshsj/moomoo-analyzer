import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { connectionApi } from '@/api/connectionApi'
import { useConnectionStore } from '@/store/connectionStore'
import { toast } from 'sonner'
import type { ConnectionConfig } from '@/types/connection'

export function useConnection() {
  const queryClient = useQueryClient()
  const setState = useConnectionStore((s) => s.setState)
  const setTradeUnlocked = useConnectionStore((s) => s.setTradeUnlocked)

  const statusQuery = useQuery({
    queryKey: ['connection'],
    queryFn: connectionApi.getStatus,
    refetchInterval: 10_000,
    staleTime: 5_000,
  })

  const connectMutation = useMutation({
    mutationFn: (config: ConnectionConfig) => connectionApi.connect(config),
    onSuccess: (data) => {
      setState(data.state)
      setTradeUnlocked(data.trade_unlocked)
      queryClient.invalidateQueries({ queryKey: ['connection'] })
      toast.success(data.message || 'Connected')
    },
    onError: (err: Error) => {
      setState('error')
      toast.error(err.message || 'Connection failed')
    },
  })

  const disconnectMutation = useMutation({
    mutationFn: () => connectionApi.disconnect(),
    onSuccess: (data) => {
      setState('disconnected')
      setTradeUnlocked(false)
      queryClient.invalidateQueries()
      toast.info('Disconnected')
    },
  })

  const unlockMutation = useMutation({
    mutationFn: (password: string) => connectionApi.unlockTrade(password),
    onSuccess: (data) => {
      setState(data.state)
      setTradeUnlocked(data.trade_unlocked)
      queryClient.invalidateQueries({ queryKey: ['connection'] })
      toast.success('Trade unlocked')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Unlock failed')
    },
  })

  return {
    status: statusQuery.data,
    isLoading: statusQuery.isLoading,
    connect: connectMutation.mutate,
    disconnect: disconnectMutation.mutate,
    unlockTrade: unlockMutation.mutate,
    isConnecting: connectMutation.isPending,
    isUnlocking: unlockMutation.isPending,
  }
}

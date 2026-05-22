import client from './client'
import type { ConnectionConfig, ConnectionStatus } from '@/types/connection'

export const connectionApi = {
  connect: async (config: ConnectionConfig): Promise<ConnectionStatus> => {
    const { data } = await client.post('/connect', config)
    return data
  },
  disconnect: async (): Promise<ConnectionStatus> => {
    const { data } = await client.delete('/connect')
    return data
  },
  getStatus: async (): Promise<ConnectionStatus> => {
    const { data } = await client.get('/connect/status')
    return data
  },
  unlockTrade: async (password: string): Promise<ConnectionStatus> => {
    const { data } = await client.post('/connect/trade-unlock', { password })
    return data
  },
}

import { create } from 'zustand'
import type { ConnectionState } from '@/types/connection'

interface ConnectionStore {
  state: ConnectionState
  tradeUnlocked: boolean
  initialized: boolean
  setState: (s: ConnectionState) => void
  setTradeUnlocked: (b: boolean) => void
  setInitialized: () => void
  isConnected: () => boolean
}

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  state: 'disconnected',
  tradeUnlocked: false,
  initialized: false,
  setState: (s) => set({ state: s }),
  setTradeUnlocked: (b) => set({ tradeUnlocked: b }),
  setInitialized: () => set({ initialized: true }),
  isConnected: () => {
    const s = get().state
    return s === 'connected' || s === 'trade_unlocked'
  },
}))

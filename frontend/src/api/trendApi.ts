import client from './client'
import type { KlineData, IndicatorSet, SrLevelsResponse, StockInfo } from '@/types/trend'

export const trendApi = {
  getKlines: async (code: string, klType = 'K_DAY', count = 250): Promise<KlineData> => {
    const { data } = await client.get(
      `/trend/${encodeURIComponent(code)}/klines?kl_type=${klType}&count=${count}`,
    )
    return data
  },
  getIndicators: async (code: string, klType = 'K_DAY', count = 250): Promise<IndicatorSet> => {
    const { data } = await client.get(
      `/trend/${encodeURIComponent(code)}/indicators?kl_type=${klType}&count=${count}`,
    )
    return data
  },
  getSrLevels: async (code: string, klType = 'K_DAY', count = 250): Promise<SrLevelsResponse> => {
    const { data } = await client.get(
      `/trend/${encodeURIComponent(code)}/sr-levels?kl_type=${klType}&count=${count}`,
    )
    return data
  },
  search: async (q: string): Promise<StockInfo[]> => {
    const { data } = await client.get(`/trend/search?q=${encodeURIComponent(q)}`)
    return data
  },
}

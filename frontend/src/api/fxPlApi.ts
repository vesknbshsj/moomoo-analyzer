import client from './client'
import type { FxPlSummary, CurrencyExposure } from '@/types/fxPl'

export const fxPlApi = {
  getSummary: async (baseCurrency = 'CNH'): Promise<FxPlSummary> => {
    const { data } = await client.get(`/fx-pl/summary?base_currency=${baseCurrency}`)
    return data
  },
  getExposure: async (baseCurrency = 'CNH'): Promise<CurrencyExposure[]> => {
    const { data } = await client.get(`/fx-pl/exposure?base_currency=${baseCurrency}`)
    return data
  },
}

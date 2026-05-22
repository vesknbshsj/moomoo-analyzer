import client from './client'
import type { RoastSummary } from '@/types/roast'

export const roastApi = {
  getRoast: async (): Promise<RoastSummary> => {
    const { data } = await client.get('/roast')
    return data
  },
  regenerate: async (): Promise<RoastSummary> => {
    const { data } = await client.post('/roast/regenerate')
    return data
  },
}

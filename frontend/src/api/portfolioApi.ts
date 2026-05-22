import client from './client'
import type { Position, PortfolioSummary, SectorBreakdown } from '@/types/portfolio'

export const portfolioApi = {
  getPositions: async (): Promise<Position[]> => {
    const { data } = await client.get('/portfolio')
    return data
  },
  getSummary: async (): Promise<PortfolioSummary> => {
    const { data } = await client.get('/portfolio/summary')
    return data
  },
  getPosition: async (code: string): Promise<Position> => {
    const { data } = await client.get(`/portfolio/${encodeURIComponent(code)}`)
    return data
  },
  getSectors: async (): Promise<SectorBreakdown[]> => {
    const { data } = await client.get('/portfolio/sectors')
    return data
  },
}

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

export interface AnalyticsOverview {
  totalTrades: number
  winRate: number
  totalNetPnl: number
  profitFactor: number
  avgWin: number
  avgLoss: number
  recentTrades?: any[]
}

export interface EquityPoint {
  date: string
  pnl: number
}

export interface PerformanceStat {
  name: string
  total: number
  wins: number
  losses: number
  pnl: number
  winRate: number
}

export interface PerformanceStats {
  bySetup: PerformanceStat[]
  bySymbol: PerformanceStat[]
  byDay?: PerformanceStat[]
  bySession?: PerformanceStat[]
  byEmotion?: PerformanceStat[]
}

export function useAnalyticsOverview() {
  return useQuery<AnalyticsOverview>({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/overview')
      return data
    },
  })
}

export function useEquityCurve() {
  return useQuery<EquityPoint[]>({
    queryKey: ['analytics', 'equity-curve'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/equity-curve')
      return data
    },
  })
}

export function usePerformanceStats() {
  return useQuery<PerformanceStats>({
    queryKey: ['analytics', 'performance'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/performance-stats')
      return data
    },
  })
}

export function useRiskMetrics() {
  return useQuery({
    queryKey: ['analytics', 'risk'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/risk-metrics')
      return data
    },
  })
}

export interface PropFirmStats {
  accountName: string
  initialBalance: number
  currentBalance: number
  todayPnl: number
  currentDrawdown: number
  consistencyScore: number
  dailyLossLimit: number
  maxDrawdownLimit: number
}

export function usePropFirmStats() {
  return useQuery<PropFirmStats>({
    queryKey: ['analytics', 'prop-firm'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/prop-firm')
      return data
    },
  })
}

export function useWeeklyReport() {
  return useQuery({
    queryKey: ['ai', 'weekly-report'],
    queryFn: async () => {
      const { data } = await apiClient.get('/ai/weekly-report')
      return data
    },
  })
}

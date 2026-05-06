import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

export interface AiReport {
  id: string
  title: string
  periodStart: string
  periodEnd: string
  weekSummary: string
  behavioralAlert?: string
  bestSetup?: string
  nextWeekFocus?: string
  createdAt: string
  fullContent: string
  geminiModel?: string
}

export function useAiReports() {
  return useQuery({
    queryKey: ['ai-reports'],
    queryFn: async () => {
      const { data } = await apiClient.get('/ai/reports')
      return data as AiReport[]
    },
  })
}

export function useAiReport(id: string) {
  return useQuery({
    queryKey: ['ai-report', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/ai/reports/${id}`)
      return data as AiReport
    },
    enabled: !!id,
  })
}

export function useAnalyzeTrade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (tradeId: string) => {
      const { data } = await apiClient.post(`/ai/analyze-trade/${tradeId}`)
      return data
    },
    onSuccess: (_, tradeId) => {
      queryClient.invalidateQueries({ queryKey: ['trade', tradeId] })
    },
  })
}

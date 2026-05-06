import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

export function useBacktestSessions() {
  return useQuery({
    queryKey: ['backtest', 'sessions'],
    queryFn: async () => {
      const { data } = await apiClient.get('/backtest/sessions')
      return data
    },
  })
}

export function useBacktestDetails(id: string) {
  return useQuery({
    queryKey: ['backtest', 'session', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/backtest/sessions/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateBacktestSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (session: any) => {
      const { data } = await apiClient.post('/backtest/sessions', session)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backtest', 'sessions'] })
    },
  })
}

export function useAddBacktestTrade(sessionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (trade: any) => {
      const { data } = await apiClient.post(`/backtest/sessions/${sessionId}/trades`, trade)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backtest', 'session', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['backtest', 'sessions'] })
    },
  })
}

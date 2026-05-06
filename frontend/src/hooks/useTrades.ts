import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

interface ListTradesParams {
  limit?: number
  symbol?: string
  status?: 'open' | 'closed'
}

export function useTrades(params: ListTradesParams = {}) {
  return useInfiniteQuery({
    queryKey: ['trades', params],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const { data } = await apiClient.get('/trades', { 
        params: { ...params, cursor: pageParam } 
      })
      return data.data // Expecting { trades: [], nextCursor: string | null }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}

export function useTrade(id: string) {
  return useQuery({
    queryKey: ['trade', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/trades/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateTrade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (trade: any) => {
      const { data } = await apiClient.post('/trades', trade)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] })
    },
  })
}

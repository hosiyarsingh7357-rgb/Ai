import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

export function usePlaybooks() {
  return useQuery({
    queryKey: ['playbooks'],
    queryFn: async () => {
      const { data } = await apiClient.get('/playbooks')
      return data
    },
  })
}

export function usePublicPlaybooks() {
  return useQuery({
    queryKey: ['playbooks', 'public'],
    queryFn: async () => {
      const { data } = await apiClient.get('/playbooks/public')
      return data
    },
  })
}

export function useCreatePlaybook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (playbook: any) => {
      const { data } = await apiClient.post('/playbooks', playbook)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] })
    },
  })
}

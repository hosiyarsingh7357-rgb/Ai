import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

export interface ChatMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1'

export function useAiCoach() {
  const coachChatMutation = useMutation({
    mutationFn: async ({ message, history }: { message: string, history: ChatMessage[] }) => {
      const { data } = await apiClient.post('/ai/coach/chat', { message, history })
      return data.response as string
    }
  })

  const streamMessage = async ({ 
    message, 
    history, 
    onUpdate 
  }: { 
    message: string, 
    history: ChatMessage[], 
    onUpdate: (text: string) => void 
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/coach/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message, history })
      })

      if (!response.ok) throw new Error('Failed to start stream')
      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        // Basic SSE parsing if the backend sends "data: text"
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              fullText += parsed.text || ''
            } catch {
              fullText += data
            }
            onUpdate(fullText)
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error)
      throw error
    }
  }

  return {
    sendMessage: coachChatMutation.mutateAsync,
    streamMessage,
    isLoading: coachChatMutation.isPending,
    error: coachChatMutation.error
  }
}

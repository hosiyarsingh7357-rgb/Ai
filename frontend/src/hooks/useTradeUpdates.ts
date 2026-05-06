import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

/**
 * useTradeUpdates Hook
 * Connects to the WebSocket server for real-time trade syncing.
 * Automatically invalidates React Query cache on trade-related events.
 */
export function useTradeUpdates() {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:4000'
    const socket = new WebSocket(`${wsUrl}/trades`)

    socket.onopen = () => {
      console.log('Real-time trade sync connected')
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        switch (data.type) {
          case 'TRADE_CREATED':
          case 'TRADE_UPDATED':
          case 'TRADE_DELETED':
            // Invalidate the entire trades list
            queryClient.invalidateQueries({ queryKey: ['trades'] })
            
            // Invalidate specific trade details if available
            if (data.tradeId) {
              queryClient.invalidateQueries({ queryKey: ['trade', data.tradeId] })
            }
            
            // Also invalidate analytics as PnL might have changed
            queryClient.invalidateQueries({ queryKey: ['analytics'] })
            break;
            
          default:
            break;
        }
      } catch (error) {
        console.warn('Real-time sync parse error:', error)
      }
    }

    socket.onclose = () => {
      console.log('Real-time trade sync disconnected')
    }

    socket.onerror = (error) => {
      console.error('Real-time sync websocket error:', error)
    }

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close()
      }
    }
  }, [queryClient])
}

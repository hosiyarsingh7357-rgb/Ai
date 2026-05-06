import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import { useAuthStore } from '@/store/auth.store'

/**
 * useTradeUpdates Hook
 * Connects to the WebSocket server for real-time trade syncing.
 * Automatically invalidates React Query cache on trade-related events.
 */
export function useTradeUpdates() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  useEffect(() => {
    if (typeof window === 'undefined' || !user) return

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000'
    const socket = io(wsUrl)

    socket.on('connect', () => {
      console.log('Real-time trade sync connected')
      socket.emit('join', user.id)
    })

    socket.on('TRADE_UPDATED', (data) => {
      // Invalidate the entire trades list
      queryClient.invalidateQueries({ queryKey: ['trades'] })
      
      // Invalidate specific trade details if available
      if (data?.tradeId) {
        queryClient.invalidateQueries({ queryKey: ['trade', data.tradeId] })
      }
      
      // Also invalidate analytics as PnL might have changed
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    })

    socket.on('disconnect', () => {
      console.log('Real-time trade sync disconnected')
    })

    socket.on('error', (error) => {
      console.error('Real-time sync websocket error:', error)
    })

    return () => {
      socket.disconnect()
    }
  }, [queryClient, user])
}

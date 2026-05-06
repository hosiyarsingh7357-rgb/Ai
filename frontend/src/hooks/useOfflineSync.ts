import { useEffect, useState, useCallback } from 'react'
import { offlineStorage, SyncError } from '@/lib/offlineStorage'
import { apiClient } from '@/lib/apiClient'
import axios from 'axios'

export function useOfflineSync() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [errorCount, setErrorCount] = useState(0)

  const syncQueue = useCallback(async () => {
    if (isSyncing) return
    
    const queue = await offlineStorage.getQueue()
    if (queue.length === 0) return

    setIsSyncing(true)
    console.log(`Starting sync for ${queue.length} items...`)

    for (const item of queue) {
      try {
        const { id, queuedAt, ...apiData } = item
        await apiClient.post('/trades', apiData)
        await offlineStorage.removeFromQueue(id)
        console.log(`Synced trade: ${item.symbol}`)
      } catch (error: any) {
        console.error(`Failed to sync trade ${item.id}:`, error)

        // Handle specific error types
        if (axios.isAxiosError(error) && error.response) {
          const status = error.response.status
          
          // If it's a validation error (400) or other client errors in 4xx range
          // move it to the error log instead of retrying forever
          if (status >= 400 && status < 500 && status !== 401 && status !== 429) {
            const syncError: SyncError = {
              id: item.id,
              data: item,
              error: error.response.data?.message || 'Validation failed',
              timestamp: new Date().toISOString()
            }
            
            await offlineStorage.addToErrorLog(syncError)
            await offlineStorage.removeFromQueue(item.id)
            setErrorCount(prev => prev + 1)
            console.warn(`Moved trade ${item.id} to error log due to status ${status}`)
          }
        }
        // If it's a network error or 5xx, we keep it in the queue to retry
        break; // Stop processing the rest of the queue for now
      }
    }

    setIsSyncing(false)
  }, [isSyncing])

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (navigator.onLine) {
      syncQueue()
    }

    const handleOnline = () => syncQueue()
    window.addEventListener('online', handleOnline)
    
    // Periodically check if online and queue has items
    const interval = setInterval(() => {
      if (navigator.onLine) syncQueue()
    }, 60000)

    return () => {
      window.removeEventListener('online', handleOnline)
      clearInterval(interval)
    }
  }, [syncQueue])

  return { isSyncing, errorCount }
}

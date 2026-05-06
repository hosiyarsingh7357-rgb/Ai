'use client'

import { useState, useEffect } from 'react'
import { offlineStorage, SyncError } from '@/lib/offlineStorage'

export function useSyncErrors() {
  const [errors, setErrors] = useState<SyncError[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = async () => {
    const logs = await offlineStorage.getErrorLogs()
    setErrors(logs)
    setIsLoading(false)
  }

  useEffect(() => {
    refresh()
    // Optional: add interval or event listener if needed
  }, [])

  const resolveError = async (id: string) => {
    await offlineStorage.removeFromErrorLog(id)
    await refresh()
  }

  const retryError = async (error: SyncError) => {
    // Add back to queue and remove from error log
    const { data } = error
    await offlineStorage.addToQueue(data)
    await offlineStorage.removeFromErrorLog(error.id)
    await refresh()
  }

  return { errors, isLoading, refresh, resolveError, retryError }
}

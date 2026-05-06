'use client'

import { useRef, useCallback } from 'react'

export function useThrottle<T extends (...args: any[]) => any>(
  fn: T, 
  delay = 100
): T {
  const lastRun = useRef(0)

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now()

    if (now - lastRun.current >= delay) {
      lastRun.current = now
      return fn(...args)
    }
  }, [fn, delay]) as T
}

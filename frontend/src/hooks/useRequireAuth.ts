'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

export function useRequireAuth() {
  const { user, accessToken } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // If no token and not on login/signup, redirect to login
    if (!accessToken && !['/login', '/signup'].includes(pathname)) {
      router.push('/login')
    }
    
    // If authed but onboarding not done, and not on onboarding page, redirect there
    if (user && !user.onboardingCompleted && pathname !== '/onboarding' && !['/login', '/signup'].includes(pathname)) {
      router.push('/onboarding')
    }
  }, [accessToken, user, pathname, router])

  return { user, isLoading: false }
}

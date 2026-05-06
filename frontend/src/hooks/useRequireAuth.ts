'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

export function useRequireAuth() {
  const { user } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // If no user and not on login/signup, redirect to login
    if (!user && !['/login', '/signup'].includes(pathname)) {
      router.push('/login')
    }
    
    // If authed but onboarding not done, and not on onboarding page, redirect there
    if (user && !user.onboardingCompleted && pathname !== '/onboarding' && !['/login', '/signup'].includes(pathname)) {
      router.push('/onboarding')
    }
  }, [user, pathname, router])

  return { user, isLoading: false }
}

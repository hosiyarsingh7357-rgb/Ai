import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/apiClient'
import Cookies from 'js-cookie'

interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  subscriptionTier: 'free' | 'pro' | 'elite'
  onboardingCompleted: boolean
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      setAuth: (user, accessToken, refreshToken) => {
        // Store tokens in Cookies (accessible by server middleware)
        Cookies.set('access_token', accessToken, { expires: 7, sameSite: 'strict' })
        Cookies.set('refresh_token', refreshToken, { expires: 30, sameSite: 'strict' })
        
        set({ user, accessToken, refreshToken })
      },

      logout: () => {
        // Clear cookies
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
        
        set({ user: null, accessToken: null, refreshToken: null })
        apiClient.post('/auth/logout').catch(() => {})
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        // Don't persist tokens in localStorage via Zustand
      }),
    }
  )
)

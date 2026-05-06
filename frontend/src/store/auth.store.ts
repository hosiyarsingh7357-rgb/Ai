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
  isLoading: boolean
  setAuth: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      setAuth: (user) => {
        set({ user })
      },

      logout: () => {
        set({ user: null })
        apiClient.post('/auth/logout').catch(() => {})
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
)

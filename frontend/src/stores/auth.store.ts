import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: Pick<User, 'id' | 'email' | 'fullName' | 'role'> | null
  token: string | null
  setAuth: (token: string, user: AuthState['user']) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}

// Persisted auth store — survives page refresh
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setAuth: (token, user) => {
        localStorage.setItem('access_token', token)
        set({ token, user })
      },

      clearAuth: () => {
        localStorage.removeItem('access_token')
        set({ token: null, user: null })
      },

      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)

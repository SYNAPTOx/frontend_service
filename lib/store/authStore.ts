import { create } from 'zustand'

export interface AuthUser {
  _id: string
  name: string
  email: string
  college?: string
  branch?: string
  year?: number
  semester?: number
  section?: string
  isCR: boolean
  profileComplete?: boolean
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  setUser: (user: AuthUser) => void
  setToken: (token: string) => void
  setAuth: (user: AuthUser, token: string) => void
  clear: () => void
  isAuthenticated: () => boolean
}

export const isProfileComplete = (user: AuthUser | null): boolean => {
  if (!user) return false
  return !!(user.name && user.college && user.branch && user.year && user.semester && user.section)
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),

  setAuth: (user, token) => {
    set({ user, token })
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    }
  },

  clear: () => {
    set({ user: null, token: null })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  isAuthenticated: () => !!get().token,
}))

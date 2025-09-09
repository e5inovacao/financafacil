import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { supabase, getCurrentUser } from './supabase'

interface AuthState {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  initialize: async () => {
    try {
      set({ loading: true })
      const user = await getCurrentUser()
      set({ user, loading: false })
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({ user: null, loading: false })
    }
  }
}))

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  const { setUser } = useAuthStore.getState()
  setUser(session?.user ?? null)
})
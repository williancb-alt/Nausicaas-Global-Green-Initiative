import { create } from "zustand"
import type { UserInfo } from "../services/api/client"

interface AuthState {
  isAuthenticated: boolean
  user: UserInfo | null
  setUser: (user: UserInfo | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>(set => ({
  isAuthenticated: false,
  user: null,
  setUser: user => set({ user, isAuthenticated: !!user }),
  clearAuth: () => set({ isAuthenticated: false, user: null }),
}))

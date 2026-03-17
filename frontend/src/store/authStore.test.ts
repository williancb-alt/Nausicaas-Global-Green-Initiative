import { describe, it, expect, beforeEach } from "vitest"
import { useAuthStore } from "./authStore"

describe("useAuthStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const { clearAuth } = useAuthStore.getState()
    clearAuth()
  })

  it("should have correct initial state", () => {
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
  })

  it("should set user and mark as authenticated", () => {
    const mockUser = {
      email: "test@example.com",
      admin: false,
      public_id: "user-123",
    }

    useAuthStore.getState().setUser(mockUser)

    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.isAuthenticated).toBe(true)
  })

  it("should clear user and mark as unauthenticated on clearAuth", () => {
    const mockUser = {
      email: "test@example.com",
      admin: false,
      public_id: "user-123",
    }

    // Set user first
    useAuthStore.getState().setUser(mockUser)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)

    // Then clear
    useAuthStore.getState().clearAuth()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it("should set isAuthenticated to false when user is null", () => {
    useAuthStore.getState().setUser(null)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})

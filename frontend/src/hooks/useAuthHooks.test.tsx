import { renderHook, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useLogin, useLogout, useRegister, useUser } from "./useAuthHooks"
import { api } from "../services/api"
import { useAuthStore } from "../store/authStore"
import { mockUser, mockAdminUser } from "../test/mock-data"
import { TestWrapper } from "../test/test-utils"

const mockCaptureException = vi.fn()

// Mock dependencies
vi.mock("../services/api")
vi.mock("../store/authStore")
vi.mock("../services/monitoring", () => ({
  getMonitoring: () => ({
    captureException: mockCaptureException,
    setUser: vi.fn(),
    setTag: vi.fn(),
  }),
}))

describe("useAuthHooks", () => {
  const setUserMock = vi.fn()
  const clearAuthMock = vi.fn()
  const authSuccess = { status: "success", message: "ok" } as any

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthStore).mockReturnValue({
      setUser: setUserMock,
      clearAuth: clearAuthMock,
      user: null,
    } as any)
  })

  describe.each([
    {
      name: "useLogin",
      hook: useLogin,
      mockAuthFn: () => vi.mocked(api.auth.login),
      email: "test@test.com",
      expectedAuthCall: ["test@test.com", "password"],
    },
    {
      name: "useRegister",
      hook: useRegister,
      mockAuthFn: () => vi.mocked(api.auth.register),
      email: "new@test.com",
      expectedAuthCall: ["new@test.com", "password"],
    },
  ])("$name", ({ hook, mockAuthFn, email, expectedAuthCall }) => {
    it("should authenticate and set user on success", async () => {
      mockAuthFn().mockResolvedValue(authSuccess)
      vi.mocked(api.auth.getUser).mockResolvedValue(mockUser as any)

      const { result } = renderHook(() => hook(), { wrapper: TestWrapper })
      result.current.mutate({ email, password: "password" })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockAuthFn()).toHaveBeenCalledWith(...expectedAuthCall)
      expect(api.auth.getUser).toHaveBeenCalled()
      expect(setUserMock).toHaveBeenCalledWith(mockUser)
    })
  })

  describe("useLogin", () => {
    it("should handle getUser error gracefully", async () => {
      vi.mocked(api.auth.login).mockResolvedValue(authSuccess)
      vi.mocked(api.auth.getUser).mockRejectedValue(new Error("Failed"))

      const { result } = renderHook(() => useLogin(), {
        wrapper: TestWrapper,
      })
      result.current.mutate({ email: "test@test.com", password: "password" })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockCaptureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ context: "post-login user fetch" }),
      )
    })
  })

  describe("useLogout", () => {
    it("should logout and clear auth on success", async () => {
      vi.mocked(api.auth.logout).mockResolvedValue(authSuccess)

      const { result } = renderHook(() => useLogout(), {
        wrapper: TestWrapper,
      })
      result.current.mutate()

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(api.auth.logout).toHaveBeenCalled()
      expect(clearAuthMock).toHaveBeenCalled()
    })
  })

  describe("useUser", () => {
    it("should fetch user and set it in store", async () => {
      vi.mocked(api.auth.getUser).mockResolvedValue(mockAdminUser as any)

      const { result } = renderHook(() => useUser(), {
        wrapper: TestWrapper,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(setUserMock).toHaveBeenCalledWith(mockAdminUser)
    })

    it("should clear auth if user fetch fails", async () => {
      vi.mocked(api.auth.getUser).mockRejectedValue(new Error("No user"))

      const { result } = renderHook(() => useUser(), {
        wrapper: TestWrapper,
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(clearAuthMock).toHaveBeenCalled()
    })
  })
})

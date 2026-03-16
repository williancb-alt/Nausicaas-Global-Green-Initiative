import { renderHook, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useLogin, useLogout, useRegister, useUser } from "./useAuthHooks"
import { api } from "../services/api"
import { useAuthStore } from "../store/authStore"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

// Mock dependencies
vi.mock("../services/api")
vi.mock("../store/authStore")

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client= { queryClient } > { children } </QueryClientProvider>
  )
}

describe("useAuthHooks", () => {
    const setUserMock = vi.fn()
    const clearAuthMock = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useAuthStore).mockReturnValue({
            setUser: setUserMock,
            clearAuth: clearAuthMock,
            user: null
        } as any)
    })

    describe("useLogin", () => {
        it("should login and set user on success", async () => {
            const mockUser = { email: "test@test.com", admin: false }
            vi.mocked(api.auth.login).mockResolvedValue({ status: "success", message: "ok" } as any)
            vi.mocked(api.auth.getUser).mockResolvedValue(mockUser as any)

            const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() })

            result.current.mutate({ email: "test@test.com", password: "password" })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(api.auth.login).toHaveBeenCalledWith("test@test.com", "password")
            expect(api.auth.getUser).toHaveBeenCalled()
            expect(setUserMock).toHaveBeenCalledWith(mockUser)
        })

        it("should handle getUser error gracefully", async () => {
            vi.mocked(api.auth.login).mockResolvedValue({ status: "success", message: "ok" } as any)
            vi.mocked(api.auth.getUser).mockRejectedValue(new Error("Failed"))
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { })

            const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() })
            result.current.mutate({ email: "test@test.com", password: "password" })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(consoleSpy).toHaveBeenCalled()
            consoleSpy.mockRestore()
        })
    })

    describe("useLogout", () => {
        it("should logout and clear auth on success", async () => {
            vi.mocked(api.auth.logout).mockResolvedValue({ status: "success", message: "ok" } as any)

            const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() })
            result.current.mutate()

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(api.auth.logout).toHaveBeenCalled()
            expect(clearAuthMock).toHaveBeenCalled()
        })
    })

    describe("useRegister", () => {
        it("should register and set user on success", async () => {
            const mockUser = { email: "new@test.com", admin: false }
            vi.mocked(api.auth.register).mockResolvedValue({ status: "success", message: "ok" } as any)
            vi.mocked(api.auth.getUser).mockResolvedValue(mockUser as any)

            const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() })
            result.current.mutate({ email: "new@test.com", password: "password" })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(api.auth.register).toHaveBeenCalledWith("new@test.com", "password")
            expect(setUserMock).toHaveBeenCalledWith(mockUser)
        })
    })

    describe("useUser", () => {
        it("should fetch user and set it in store", async () => {
            const mockUser = { email: "cached@test.com", admin: true }
            vi.mocked(api.auth.getUser).mockResolvedValue(mockUser as any)

            const { result } = renderHook(() => useUser(), { wrapper: createWrapper() })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(setUserMock).toHaveBeenCalledWith(mockUser)
        })

        it("should clear auth if user fetch fails", async () => {
            vi.mocked(api.auth.getUser).mockRejectedValue(new Error("No user"))

            const { result } = renderHook(() => useUser(), { wrapper: createWrapper() })

            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(clearAuthMock).toHaveBeenCalled()
        })
    })
})

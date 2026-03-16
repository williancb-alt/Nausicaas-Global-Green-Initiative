import { describe, it, expect, vi, beforeEach } from "vitest"
import { authApi } from "./auth"
import { apiClient } from "./client"

vi.mock("./client", async importOriginal => {
    const actual = await importOriginal<typeof import("./client")>()
    return {
        ...actual,
        apiClient: {
            post: vi.fn(),
            get: vi.fn(),
        },
    }
})

const mockedPost = vi.mocked(apiClient.post)
const mockedGet = vi.mocked(apiClient.get)

describe("authApi", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("should call register endpoint and return data", async () => {
        const mockResponse = { status: "success", message: "registered" }
        mockedPost.mockResolvedValueOnce({ data: mockResponse } as any)

        const result = await authApi.register("test@example.com", "password123")
        expect(result).toEqual(mockResponse)
        expect(mockedPost).toHaveBeenCalledWith(
            "/api/v1/auth/register",
            expect.any(URLSearchParams),
        )
    })

    it("should call login endpoint and return data", async () => {
        const mockResponse = { status: "success", message: "logged in" }
        mockedPost.mockResolvedValueOnce({ data: mockResponse } as any)

        const result = await authApi.login("test@example.com", "password123")
        expect(result).toEqual(mockResponse)
        expect(mockedPost).toHaveBeenCalledWith(
            "/api/v1/auth/login",
            expect.any(URLSearchParams),
        )
    })

    it("should call getUser endpoint and return user data", async () => {
        const mockUser = { email: "test@example.com", admin: false }
        mockedGet.mockResolvedValueOnce({ data: mockUser } as any)

        const result = await authApi.getUser()
        expect(result).toEqual(mockUser)
        expect(mockedGet).toHaveBeenCalledWith("/api/v1/auth/user")
    })

    it("should call logout endpoint", async () => {
        const mockResponse = { status: "success", message: "logged out" }
        mockedPost.mockResolvedValueOnce({ data: mockResponse } as any)

        const result = await authApi.logout()
        expect(result).toEqual(mockResponse)
        expect(mockedPost).toHaveBeenCalledWith("/api/v1/auth/logout")
    })

    it("should call forgotPassword endpoint", async () => {
        const mockResponse = { status: "success", message: "email sent" }
        mockedPost.mockResolvedValueOnce({ data: mockResponse } as any)

        const result = await authApi.forgotPassword("test@example.com")
        expect(result).toEqual(mockResponse)
        expect(mockedPost).toHaveBeenCalledWith(
            "/api/v1/auth/forgot-password",
            expect.any(URLSearchParams),
        )
    })

    it("should call resetPassword endpoint", async () => {
        const mockResponse = { status: "success", message: "password reset" }
        mockedPost.mockResolvedValueOnce({ data: mockResponse } as any)

        const result = await authApi.resetPassword("token-123", "newpassword")
        expect(result).toEqual(mockResponse)
        expect(mockedPost).toHaveBeenCalledWith(
            "/api/v1/auth/reset-password",
            expect.any(URLSearchParams),
        )
    })
})

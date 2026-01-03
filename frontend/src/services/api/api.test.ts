import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Mock } from "vitest"
import type { AuthSuccess, Grant, GrantPage } from "./client"
import { api } from "./index"

const { mockPost, mockGet, mockPut, mockDelete } = vi.hoisted(() => {
  return {
    mockPost: vi.fn(),
    mockGet: vi.fn(),
    mockPut: vi.fn(),
    mockDelete: vi.fn(),
  }
})

vi.mock("axios", () => {
  const mockAxiosInstance = {
    post: mockPost,
    get: mockGet,
    put: mockPut,
    delete: mockDelete,
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: { baseURL: "http://localhost:4000/v1" },
  }

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  }
})

describe("api (auth + grants)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("auth.register", () => {
    it("should register a new user", async () => {
      const mockResponse: AuthSuccess = {
        status: "success",
        message: "successfully registered",
        token_type: "bearer",
        expires_in: 900,
      }

      ;(mockPost as Mock).mockResolvedValue({ data: mockResponse })

      const result = await api.auth.register("test@example.com", "password123")

      expect(result).toEqual(mockResponse)
      expect(mockPost).toHaveBeenCalledWith(
        "/api/v1/auth/register",
        expect.any(URLSearchParams),
      )
    })
  })

  describe("auth.login", () => {
    it("should login a user", async () => {
      const mockResponse: AuthSuccess = {
        status: "success",
        message: "successfully logged in",
        token_type: "bearer",
        expires_in: 900,
      }

      ;(mockPost as Mock).mockResolvedValue({ data: mockResponse })

      const result = await api.auth.login("test@example.com", "password123")

      expect(result).toEqual(mockResponse)
      expect(mockPost).toHaveBeenCalledWith(
        "/api/v1/auth/login",
        expect.any(URLSearchParams),
      )
    })
  })

  describe("auth.getUser", () => {
    it("should get user info", async () => {
      const mockResponse = {
        email: "test@example.com",
        admin: false,
        public_id: "123",
      }

      ;(mockGet as Mock).mockResolvedValue({ data: mockResponse })

      const result = await api.auth.getUser()

      expect(result).toEqual(mockResponse)
      expect(mockGet).toHaveBeenCalledWith("/api/v1/auth/user")
    })
  })

  describe("auth.logout", () => {
    it("should logout a user", async () => {
      const mockResponse = {
        status: "success",
        message: "successfully logged out",
      }

      ;(mockPost as Mock).mockResolvedValue({ data: mockResponse })

      const result = await api.auth.logout()

      expect(result).toEqual(mockResponse)
      expect(mockPost).toHaveBeenCalledWith("/api/v1/auth/logout")
    })
  })

  describe("grants.createGrant", () => {
    it("should create a grant", async () => {
      const mockResponse = {
        status: "success",
        message: "New grant added: test-grant.",
      }

      ;(mockPost as Mock).mockResolvedValue({ data: mockResponse })

      const result = await api.grants.createGrant({
        name: "test-grant",
        deadline: "12/31/2024",
      })

      expect(result).toEqual(mockResponse)
      expect(mockPost).toHaveBeenCalledWith(
        "/api/v1/grants",
        expect.any(URLSearchParams),
      )
    })
  })

  describe("grants.listGrants", () => {
    it("should list grants", async () => {
      const mockResponse: GrantPage = {
        links: {
          self: "/api/v1/grants?page=1&per_page=10",
          first: "/api/v1/grants?page=1&per_page=10",
          last: "/api/v1/grants?page=1&per_page=10",
        },
        has_prev: false,
        has_next: false,
        page: 1,
        total_pages: 1,
        items_per_page: 10,
        total_items: 1,
        items: [
          {
            name: "test-grant",
            deadline: "2024-12-31",
            deadline_passed: false,
            time_remaining: "30 days",
          },
        ],
      }

      ;(mockGet as Mock).mockResolvedValue({ data: mockResponse })

      const result = await api.grants.listGrants(1, 10)

      expect(result).toEqual(mockResponse)
      expect(mockGet).toHaveBeenCalledWith("/api/v1/grants", {
        params: { page: 1, per_page: 10 },
      })
    })
  })

  describe("grants.getGrant", () => {
    it("should get a single grant", async () => {
      const mockResponse: Grant = {
        name: "test-grant",
        deadline: "2024-12-31",
        deadline_passed: false,
        time_remaining: "30 days",
      }

      ;(mockGet as Mock).mockResolvedValue({ data: mockResponse })

      const result = await api.grants.getGrant("test-grant")

      expect(result).toEqual(mockResponse)
      expect(mockGet).toHaveBeenCalledWith("/api/v1/grants/test-grant")
    })
  })

  describe("grants.updateGrant", () => {
    it("should update a grant", async () => {
      const mockResponse: Grant = {
        name: "test-grant",
        deadline: "2025-01-31",
        deadline_passed: false,
        time_remaining: "60 days",
      }

      ;(mockPut as Mock).mockResolvedValue({ data: mockResponse })

      const result = await api.grants.updateGrant("test-grant", {
        deadline: "01/31/2025",
      })

      expect(result).toEqual(mockResponse)
      expect(mockPut).toHaveBeenCalledWith(
        "/api/v1/grants/test-grant",
        expect.any(URLSearchParams),
      )
    })
  })

  describe("grants.deleteGrant", () => {
    it("should delete a grant", async () => {
      ;(mockDelete as Mock).mockResolvedValue({ status: 204 })

      await api.grants.deleteGrant("test-grant")

      expect(mockDelete).toHaveBeenCalledWith("/api/v1/grants/test-grant")
    })
  })
})

import { renderHook, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useDashboardData } from "./useDashboardData"
import { api } from "../services/api"
import type { UserInfo, GrantPage } from "../services/api/client"

// Mock the API
vi.mock("../services/api", () => ({
  api: {
    grants: {
      listGrants: vi.fn(),
    },
    applications: {
      getMyApplications: vi.fn(),
    },

  },
}))

describe("useDashboardData", () => {
  const mockUser: UserInfo = {
    email: "test@example.com",
    admin: false,
    public_id: "user-123",
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Suppress console.error in tests
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useDashboardData(null))

    expect(result.current.availableGrants).toEqual([])
    expect(result.current.myApps).toEqual({ count: 0 })
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe("")
  })

  it("should fetch grants when user is provided", async () => {
    const mockGrants: GrantPage = {
      items: [
        {
          name: "Grant 1",
          deadline: "2026-12-31",
          deadline_passed: false,
          time_remaining: "10 months",
        },
        {
          name: "Grant 2",
          deadline: "2024-01-01",
          deadline_passed: true,
          time_remaining: "Expired",
        },
      ],
      total_items: 2,
      total_pages: 1,
      page: 1,
      has_next: false,
      has_prev: false,
      items_per_page: 10,
      links: { self: "", first: "", last: "" },
    }

    vi.mocked(api.grants.listGrants).mockResolvedValueOnce(mockGrants)
    vi.mocked(api.applications.getMyApplications).mockResolvedValueOnce({
      items: [],
      has_prev: false,
      has_next: false,
      page: 1,
      total_pages: 1,
      total_items: 2,
    })


    const { result } = renderHook(() => useDashboardData(mockUser))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.availableGrants).toHaveLength(1)
    expect(result.current.availableGrants[0].name).toBe("Grant 1")
    expect(result.current.myApps.count).toBe(2)
    expect(result.current.error).toBe("")
  })

  it("should handle error during fetch", async () => {
    vi.mocked(api.grants.listGrants).mockRejectedValueOnce(
      new Error("API Error"),
    )

    const { result } = renderHook(() => useDashboardData(mockUser))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe("Failed to load dashboard data")
    expect(result.current.availableGrants).toEqual([])
  })
})

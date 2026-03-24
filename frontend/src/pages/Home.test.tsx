import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { Home } from "./Home"
import { useAuthStore } from "../store/authStore"
import { useGrantsStore } from "../store/grantsStore"
import {
  useGrants,
  useCreateGrant,
  useDeleteGrant,
} from "../hooks/useGrantHooks"
import { useQueryClient } from "@tanstack/react-query"

import { mockAdminUser, EMPTY_PAGINATED_RESPONSE } from "../test/mock-data"
import { mockMutationSuccess, mockMutationLoading } from "../test/test-utils"

// Mock everything the component depends on
vi.mock("../store/authStore")
vi.mock("../store/grantsStore")
vi.mock("../hooks/useGrantHooks")
vi.mock("@tanstack/react-query", async importOriginal => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>()
  return {
    ...actual,
    useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
  }
})

const mockUseGrants = (overrides: Record<string, unknown> = {}) => {
  vi.mocked(useGrants).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...overrides,
  } as any)
}

describe("Home Page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: mockAdminUser,
      setUser: vi.fn(),
      clearAuth: vi.fn(),
    } as any)
    vi.mocked(useGrantsStore).mockReturnValue({
      currentPage: 1,
      itemsPerPage: 10,
      setCurrentPage: vi.fn(),
      setItemsPerPage: vi.fn(),
      reset: vi.fn(),
    } as any)
    mockUseGrants()
    vi.mocked(useCreateGrant).mockReturnValue(mockMutationSuccess() as any)
    vi.mocked(useDeleteGrant).mockReturnValue(mockMutationSuccess() as any)
    vi.mocked(useQueryClient).mockReturnValue({
      invalidateQueries: vi.fn(),
      clear: vi.fn(),
      removeQueries: vi.fn(),
    } as any)
  })

  it("should render the Create Grant form", () => {
    render(<Home />)
    // Both the heading and the button say "Create Grant" - assert the heading h2 exists
    expect(screen.getAllByText(/Create Grant/i).length).toBeGreaterThanOrEqual(
      1,
    )
    expect(screen.getByText("Grant Name")).toBeDefined()
  })

  it("should render the List Grants section", () => {
    render(<Home />)
    expect(screen.getByText("List Grants")).toBeDefined()
  })

  it("should show loading state for grants", () => {
    mockUseGrants({ isLoading: true })
    render(<Home />)
    expect(screen.getByText(/Loading grants/i)).toBeDefined()
  })

  it("should show empty state when no grants exist", () => {
    mockUseGrants({ data: EMPTY_PAGINATED_RESPONSE })
    render(<Home />)
    expect(screen.getByText(/no grants/i)).toBeDefined()
  })

  it("should list grants when data is available", () => {
    mockUseGrants({
      data: {
        ...EMPTY_PAGINATED_RESPONSE,
        items: [
          {
            name: "Env Grant",
            description: "Desc",
            deadline: "2026-12-31",
            deadline_passed: false,
            time_remaining: "1 year",
            hidden: false,
          },
        ],
        total_pages: 1,
        total_items: 1,
      },
    })
    render(<Home />)
    expect(screen.getByText("Env Grant")).toBeDefined()
  })

  it("should render Add Field button", () => {
    render(<Home />)
    expect(screen.getByText("+ Add Field")).toBeDefined()
  })

  it("should show create grant button", () => {
    render(<Home />)
    // Use the submit button role specifically
    expect(screen.getByRole("button", { name: /Create Grant/i })).toBeDefined()
  })

  it("should show pending state on create button", () => {
    vi.mocked(useCreateGrant).mockReturnValue(mockMutationLoading() as any)
    render(<Home />)
    expect(screen.getByText(/Creating.../i)).toBeDefined()
  })
})

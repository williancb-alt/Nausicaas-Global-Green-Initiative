import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { UserDashboard } from "./UserDashboard"
import { useMyApplications } from "../hooks/useApplicationHooks"
import { useAuthStore } from "../store/authStore"
import { useAdminStats } from "../hooks/useAdminStatsHooks"
import * as router from "react-router-dom"

import {
  mockUser,
  EMPTY_PAGINATED_RESPONSE,
  mockApplication,
} from "../test/mock-data"

// Mock dependencies
vi.mock("../hooks/useApplicationHooks")
vi.mock("../store/authStore")
vi.mock("../hooks/useAdminStatsHooks")

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...(actual as object),
    useNavigate: vi.fn(),
  }
})

// Mock StatCard to simplify text matching
vi.mock("../components/card/StatsCard", () => ({
  StatCard: ({ label, value }: { label: string; value: number }) => (
    <div data-testid="stat-card">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
}))

describe("UserDashboard", () => {
  const navigateMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(router.useNavigate).mockReturnValue(navigateMock)

    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      setUser: vi.fn(),
      clearAuth: vi.fn(),
    } as any)
    vi.mocked(useMyApplications).mockReturnValue({
      data: {
        ...EMPTY_PAGINATED_RESPONSE,
        items: [mockApplication],
        total_items: 1,
      },
      isLoading: false,
      isError: false,
    } as any)
    vi.mocked(useAdminStats).mockReturnValue({
      stats: { total: 1, approved: 0, pending: 1, rejected: 0 },
      statusChartData: [],
      grantWiseData: [],
    } as any)
  })

  it("should render welcome message and stats", () => {
    render(
      <MemoryRouter>
        <UserDashboard />
      </MemoryRouter>,
    )
    expect(screen.getByText(/Welcome back, user/i)).toBeDefined()
    expect(screen.getByText("Total Applications")).toBeDefined()
    expect(screen.getAllByText("1").length).toBeGreaterThan(0)
  })

  it("should show loading state", () => {
    vi.mocked(useMyApplications).mockReturnValue({
      isLoading: true,
      isError: false,
    } as any)
    render(
      <MemoryRouter>
        <UserDashboard />
      </MemoryRouter>,
    )
    expect(screen.getByRole("status")).toBeDefined()
  })

  it("should show empty state when no applications exist", () => {
    vi.mocked(useMyApplications).mockReturnValue({
      data: EMPTY_PAGINATED_RESPONSE,
      isLoading: false,
      isError: false,
    } as any)
    vi.mocked(useAdminStats).mockReturnValue({
      stats: { total: 0, approved: 0, pending: 0, rejected: 0 },
      statusChartData: [],
      grantWiseData: [],
    } as any)

    render(
      <MemoryRouter>
        <UserDashboard />
      </MemoryRouter>,
    )
    expect(
      screen.getByText(/You haven't submitted any applications yet/),
    ).toBeDefined()
    expect(screen.getByText("Browse Grants")).toBeDefined()
  })

  it("should render the list of applications", () => {
    render(
      <MemoryRouter>
        <UserDashboard />
      </MemoryRouter>,
    )
    expect(screen.getByText("Test Grant")).toBeDefined()
    expect(screen.getByText(/pending review/i)).toBeDefined()
  })

  it("should navigate to landing page on Start New Application click", () => {
    render(
      <MemoryRouter>
        <UserDashboard />
      </MemoryRouter>,
    )
    const applyBtn = screen.getByText("+ Start New Application")
    fireEvent.click(applyBtn)
    expect(navigateMock).toHaveBeenCalledWith("/")
  })

  it("should navigate to details page on View button click", () => {
    render(
      <MemoryRouter>
        <UserDashboard />
      </MemoryRouter>,
    )
    const viewButtons = screen.getAllByText("View")
    fireEvent.click(viewButtons[0])
    expect(navigateMock).toHaveBeenCalledWith("/applications/1")
  })
})

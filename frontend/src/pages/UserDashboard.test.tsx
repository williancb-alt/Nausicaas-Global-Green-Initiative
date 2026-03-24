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

  const mockUseMyApplications = (overrides: Record<string, unknown> = {}) => {
    vi.mocked(useMyApplications).mockReturnValue({
      data: {
        ...EMPTY_PAGINATED_RESPONSE,
        items: [mockApplication],
        total_items: 1,
      },
      isLoading: false,
      isError: false,
      ...overrides,
    } as any)
  }

  const mockUseAdminStats = (
    stats = { total: 1, approved: 0, pending: 1, rejected: 0 },
  ) => {
    vi.mocked(useAdminStats).mockReturnValue({
      stats,
      statusChartData: [],
      grantWiseData: [],
    } as any)
  }

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <UserDashboard />
      </MemoryRouter>,
    )

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(router.useNavigate).mockReturnValue(navigateMock)
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      setUser: vi.fn(),
      clearAuth: vi.fn(),
    } as any)
    mockUseMyApplications()
    mockUseAdminStats()
  })

  it("should render welcome message and stats", () => {
    renderComponent()
    expect(screen.getByText(/Welcome back, user/i)).toBeDefined()
    expect(screen.getByText("Total Applications")).toBeDefined()
    expect(screen.getAllByText("1").length).toBeGreaterThan(0)
  })

  it("should show loading state", () => {
    mockUseMyApplications({ isLoading: true })
    renderComponent()
    expect(screen.getByRole("status")).toBeDefined()
  })

  it("should show empty state when no applications exist", () => {
    mockUseMyApplications({ data: EMPTY_PAGINATED_RESPONSE })
    mockUseAdminStats({ total: 0, approved: 0, pending: 0, rejected: 0 })
    renderComponent()
    expect(
      screen.getByText(/You haven't submitted any applications yet/),
    ).toBeDefined()
    expect(screen.getByText("Browse Grants")).toBeDefined()
  })

  it("should render the list of applications", () => {
    renderComponent()
    expect(screen.getByText("Test Grant")).toBeDefined()
    expect(screen.getByText(/pending review/i)).toBeDefined()
  })

  it.each([
    {
      desc: "navigate to landing page on Start New Application click",
      buttonText: "+ Start New Application",
      expectedPath: "/",
    },
    {
      desc: "navigate to details page on View button click",
      buttonText: "View",
      expectedPath: "/applications/1",
    },
  ])("should $desc", ({ buttonText, expectedPath }) => {
    renderComponent()
    const buttons = screen.getAllByText(buttonText)
    fireEvent.click(buttons[0])
    expect(navigateMock).toHaveBeenCalledWith(expectedPath)
  })
})

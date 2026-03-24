import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { AdminDashboardPage } from "./AdminDashboardPage"
import { useAuthStore } from "../store/authStore"
import { useLogout } from "../hooks/useAuthHooks"
import { useApplications } from "../hooks/useApplicationHooks"
import * as router from "react-router-dom"

import { mockAdminUser, EMPTY_PAGINATED_RESPONSE } from "../test/mock-data"
import { mockMutationSuccess } from "../test/test-utils"

// Mock dependencies
vi.mock("../store/authStore")
vi.mock("../hooks/useAuthHooks")
vi.mock("../hooks/useApplicationHooks")
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...(actual as object),
    useNavigate: vi.fn(),
  }
})

interface MockAdminDashboardProps {
  onLogout: () => void
  onManageGrants: () => void
  onManageAwards: () => void
  onViewAuditLogs: () => void
  onViewApplication: (id: number) => void
}

vi.mock("./AdminDashboard", () => ({
  AdminDashboard: ({
    onLogout,
    onManageGrants,
    onManageAwards,
    onViewAuditLogs,
    onViewApplication,
  }: MockAdminDashboardProps) => (
    <div data-testid="admin-dashboard">
      <button onClick={onLogout}>Logout</button>
      <button onClick={onManageGrants}>Manage Grants</button>
      <button onClick={onManageAwards}>Manage Awards</button>
      <button onClick={onViewAuditLogs}>Audit Logs</button>
      <button onClick={() => onViewApplication(1)}>View App 1</button>
    </div>
  ),
}))

describe("AdminDashboardPage", () => {
  const navigateMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(router.useNavigate).mockReturnValue(navigateMock)
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockAdminUser,
      isAuthenticated: true,
      setUser: vi.fn(),
      clearAuth: vi.fn(),
    } as any)
    vi.mocked(useLogout).mockReturnValue(mockMutationSuccess() as any)
    vi.mocked(useApplications).mockReturnValue({
      data: EMPTY_PAGINATED_RESPONSE,
      isLoading: false,
      isError: false,
    } as any)
  })

  it("should render AdminDashboard with correct props", () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    )
    expect(screen.getByTestId("admin-dashboard")).toBeDefined()
  })

  it("should handle navigation actions", () => {
    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText("Manage Grants"))
    expect(navigateMock).toHaveBeenCalledWith("/admin/grants")

    fireEvent.click(screen.getByText("Manage Awards"))
    expect(navigateMock).toHaveBeenCalledWith("/admin/awards")

    fireEvent.click(screen.getByText("Audit Logs"))
    expect(navigateMock).toHaveBeenCalledWith("/admin/audit")

    fireEvent.click(screen.getByText("View App 1"))
    expect(navigateMock).toHaveBeenCalledWith("/admin/applications/1")
  })

  it("should handle logout", () => {
    const logoutMutate = vi.fn()
    vi.mocked(useLogout).mockReturnValue({
      mutate: logoutMutate,
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as any)

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByText("Logout"))

    expect(logoutMutate).toHaveBeenCalled()
    expect(navigateMock).toHaveBeenCalledWith("/login")
  })
})

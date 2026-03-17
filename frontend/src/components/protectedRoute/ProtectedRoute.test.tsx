import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { ProtectedRoute } from "./ProtectedRoute"
import { useUser } from "../../hooks/useAuthHooks"

import { mockUser, mockAdminUser } from "../../test/mock-data"

// Mock dependencies
vi.mock("../../hooks/useAuthHooks")
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...(actual as object),
    Navigate: ({ to }: { to: string }) => (
      <div data-testid="navigate" data-to={to} />
    ),
  }
})

describe("ProtectedRoute", () => {
  const renderProtected = (props = {}) =>
    render(
      <ProtectedRoute {...props}>
        <div>Content</div>
      </ProtectedRoute>,
    )

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should show loading state", () => {
    vi.mocked(useUser).mockReturnValue({
      isLoading: true,
      isError: false,
    } as any)
    renderProtected()
    expect(screen.getByText("Loading...")).toBeDefined()
  })

  it("should redirect to login if not authenticated", () => {
    vi.mocked(useUser).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    } as any)
    renderProtected()
    const nav = screen.getByTestId("navigate")
    expect(nav.getAttribute("data-to")).toBe("/login")
  })

  it("should redirect to login if there is an error", () => {
    vi.mocked(useUser).mockReturnValue({
      isLoading: false,
      isError: true,
    } as any)
    renderProtected()
    const nav = screen.getByTestId("navigate")
    expect(nav.getAttribute("data-to")).toBe("/login")
  })

  it("should redirect to home if admin is required but user is not admin", () => {
    vi.mocked(useUser).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
    } as any)
    renderProtected({ requireAdmin: true })
    const nav = screen.getByTestId("navigate")
    expect(nav.getAttribute("data-to")).toBe("/")
  })

  it("should render children if authenticated and admin check passes", () => {
    vi.mocked(useUser).mockReturnValue({
      data: mockAdminUser,
      isLoading: false,
      isError: false,
    } as any)
    renderProtected({ requireAdmin: true })
    expect(screen.getByText("Content")).toBeDefined()
  })

  it("should render children if authenticated and no admin check required", () => {
    vi.mocked(useUser).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
    } as any)
    renderProtected()
    expect(screen.getByText("Content")).toBeDefined()
  })
})

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

  const mockUseUser = (overrides: Record<string, unknown> = {}) => {
    vi.mocked(useUser).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      ...overrides,
    } as any)
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should show loading state", () => {
    mockUseUser({ isLoading: true })
    renderProtected()
    expect(screen.getByText("Loading...")).toBeDefined()
  })

  it.each([
    {
      desc: "redirect to login if not authenticated",
      userOverrides: { data: null },
      props: {},
      redirectTo: "/login",
    },
    {
      desc: "redirect to login if there is an error",
      userOverrides: { isError: true },
      props: {},
      redirectTo: "/login",
    },
    {
      desc: "redirect to home if admin is required but user is not admin",
      userOverrides: { data: mockUser },
      props: { requireAdmin: true },
      redirectTo: "/",
    },
  ])("should $desc", ({ userOverrides, props, redirectTo }) => {
    mockUseUser(userOverrides)
    renderProtected(props)
    expect(screen.getByTestId("navigate").getAttribute("data-to")).toBe(
      redirectTo,
    )
  })

  it.each([
    {
      desc: "authenticated and admin check passes",
      userOverrides: { data: mockAdminUser },
      props: { requireAdmin: true },
    },
    {
      desc: "authenticated and no admin check required",
      userOverrides: { data: mockUser },
      props: {},
    },
  ])("should render children if $desc", ({ userOverrides, props }) => {
    mockUseUser(userOverrides)
    renderProtected(props)
    expect(screen.getByText("Content")).toBeDefined()
  })
})

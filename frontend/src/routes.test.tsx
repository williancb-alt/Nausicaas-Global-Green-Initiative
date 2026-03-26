import type { ReactNode } from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { routes } from "./routes"

vi.mock("./components/protectedRoute/ProtectedRoute", () => ({
  ProtectedRoute: ({
    children,
    requireAdmin = false,
  }: {
    children: ReactNode
    requireAdmin?: boolean
  }) => (
    <div
      data-testid="protected-route"
      data-require-admin={String(requireAdmin)}
    >
      {children}
    </div>
  ),
}))

vi.mock("./pages/ForgotPassword", () => ({
  ForgotPassword: () => <div data-testid="forgot-password-page" />,
}))
vi.mock("./pages/ResetPassword", () => ({
  ResetPassword: () => <div data-testid="reset-password-page" />,
}))
vi.mock("./pages/Login", () => ({
  Login: () => <div data-testid="login-page" />,
}))
vi.mock("./pages/Signup", () => ({
  Signup: () => <div data-testid="signup-page" />,
}))
vi.mock("./pages/Applications", () => ({
  Applications: () => <div data-testid="applications-page" />,
}))
vi.mock("./pages/MyApplications", () => ({
  MyApplications: () => <div data-testid="my-applications-page" />,
}))
vi.mock("./pages/UserApplicationView", () => ({
  UserApplicationView: () => <div data-testid="user-application-page" />,
}))
vi.mock("./pages/AdminDashboardPage", () => ({
  AdminDashboardPage: () => <div data-testid="admin-dashboard-page" />,
}))
vi.mock("./pages/AdminApplicationView", () => ({
  AdminApplicationView: () => <div data-testid="admin-application-page" />,
}))
vi.mock("./pages/AwardManagementPage", () => ({
  AwardManagementPage: () => <div data-testid="award-management-page" />,
}))
vi.mock("./pages/GrantManagementPage", () => ({
  GrantManagementPage: () => <div data-testid="grant-management-page" />,
}))
vi.mock("./pages/LandingPage", () => ({
  LandingPage: () => <div data-testid="landing-page" />,
}))
vi.mock("./pages/GrantApplicationPage", () => ({
  GrantApplicationPage: () => <div data-testid="grant-application-page" />,
}))
vi.mock("./pages/AuditLogs", () => ({
  AuditLogs: () => <div data-testid="audit-logs-page" />,
}))
vi.mock("./pages/UserDashboard", () => ({
  UserDashboard: () => <div data-testid="user-dashboard-page" />,
}))
vi.mock("./pages/SupportMessagesPage", () => ({
  SupportMessagesPage: () => <div data-testid="support-messages-page" />,
}))

describe("routes", () => {
  const renderRoute = (path: string) => {
    const route = routes.find(candidate => candidate.path === path)
    expect(route).toBeDefined()

    return render(<MemoryRouter>{route?.element}</MemoryRouter>)
  }

  it("should define the expected route paths", () => {
    expect(routes.map(route => route.path)).toEqual([
      "/",
      "/dashboard",
      "/grants/:grantName/apply",
      "/applications",
      "/applications/:id",
      "/admin",
      "/admin/applications",
      "/admin/applications/:id",
      "/admin/awards",
      "/admin/grants",
      "/admin/audit",
      "/admin/support",
      "/login",
      "/signup",
      "/forgot-password",
      "/reset-password",
      "*",
    ])
  })

  it("should render public page routes directly", () => {
    renderRoute("/")
    expect(screen.getByTestId("landing-page")).toBeInTheDocument()

    renderRoute("/login")
    expect(screen.getByTestId("login-page")).toBeInTheDocument()

    renderRoute("/signup")
    expect(screen.getByTestId("signup-page")).toBeInTheDocument()

    renderRoute("/forgot-password")
    expect(screen.getByTestId("forgot-password-page")).toBeInTheDocument()

    renderRoute("/reset-password")
    expect(screen.getByTestId("reset-password-page")).toBeInTheDocument()
  })

  it("should wrap authenticated user routes with ProtectedRoute", () => {
    const userRoutes = [
      ["/dashboard", "user-dashboard-page"],
      ["/grants/:grantName/apply", "grant-application-page"],
      ["/applications", "my-applications-page"],
      ["/applications/:id", "user-application-page"],
      ["/admin/awards", "award-management-page"],
    ] as const

    userRoutes.forEach(([path, pageTestId]) => {
      const { unmount } = renderRoute(path)

      expect(screen.getByTestId("protected-route")).toHaveAttribute(
        "data-require-admin",
        "false",
      )
      expect(screen.getByTestId(pageTestId)).toBeInTheDocument()

      unmount()
    })
  })

  it("should require admin for admin-only routes", () => {
    const adminRoutes = [
      ["/admin", "admin-dashboard-page"],
      ["/admin/applications", "applications-page"],
      ["/admin/applications/:id", "admin-application-page"],
      ["/admin/grants", "grant-management-page"],
      ["/admin/audit", "audit-logs-page"],
      ["/admin/support", "support-messages-page"],
    ] as const

    adminRoutes.forEach(([path, pageTestId]) => {
      const { unmount } = renderRoute(path)

      expect(screen.getByTestId("protected-route")).toHaveAttribute(
        "data-require-admin",
        "true",
      )
      expect(screen.getByTestId(pageTestId)).toBeInTheDocument()

      unmount()
    })
  })

  it("should redirect unknown routes to the landing page", () => {
    const fallbackRoute = routes.find(route => route.path === "*")
    expect(fallbackRoute?.element.props.to).toBe("/")
    expect(fallbackRoute?.element.props.replace).toBe(true)
  })
})

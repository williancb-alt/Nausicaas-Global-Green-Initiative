import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MemoryRouter } from "react-router-dom"
import Navbar from "./NavBar"
import { useAuthStore } from "../../store/authStore"

vi.mock("../../store/authStore")
vi.mock("./LogoutButton", () => ({
  LogoutButton: () => <button data-testid="logout-btn">Logout</button>,
}))

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render public links when not authenticated", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      user: null,
      setUser: vi.fn(),
      clearAuth: vi.fn(),
    })
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    )

    expect(screen.getByText("Login")).toBeDefined()
    expect(screen.getByText("Sign Up")).toBeDefined()
    expect(screen.queryByText("Dashboard")).toBeNull()
  })

  it("should render user links when authenticated as regular user", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { email: "user@test.com", admin: false, public_id: "user-1" },
      setUser: vi.fn(),
      clearAuth: vi.fn(),
    })
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    )

    expect(screen.getByText("Home")).toBeDefined()
    expect(screen.getByText("Dashboard")).toBeDefined()
    expect(screen.getByTestId("logout-btn")).toBeDefined()
    expect(screen.queryByText("Grants")).toBeNull()
  })

  it("should render admin links when authenticated as admin", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { email: "admin@test.com", admin: true, public_id: "admin-1" },
      setUser: vi.fn(),
      clearAuth: vi.fn(),
    })
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    )

    expect(screen.getByText("Dashboard")).toBeDefined()
    expect(screen.getByText("Applications")).toBeDefined()
    expect(screen.getByText("Grants")).toBeDefined()
    expect(screen.getByText("Awards")).toBeDefined()
    expect(screen.getByTestId("logout-btn")).toBeDefined()
  })
})

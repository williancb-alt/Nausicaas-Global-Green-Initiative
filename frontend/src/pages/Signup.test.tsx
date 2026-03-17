import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { Signup } from "./Signup"
import { useRegister } from "../hooks/useAuthHooks"
import { useAuthStore } from "../store/authStore"
import { BUTTON_TEXT } from "../utils/constants"

vi.mock("../hooks/useAuthHooks")
vi.mock("../store/authStore")
vi.mock("../features/oauth/OAuthButtons", () => ({
  OAuthButtons: () => null,
}))
// Mock PasswordRequirements to avoid complex validation UI testing
vi.mock("../components/form/PasswordRequirements", () => ({
  PasswordRequirements: () => <div data-testid="password-reqs" />,
}))

const renderInRouter = () =>
  render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>,
  )

describe("Signup Page", () => {
  const mutateMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      user: null,
      setUser: vi.fn(),
      clearAuth: vi.fn(),
    } as any)
    vi.mocked(useRegister).mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
      isSuccess: false,
      status: "idle",
      data: undefined,
    } as any)
  })

  it("should render the signup form", () => {
    renderInRouter()
    expect(screen.getByPlaceholderText("Enter your email")).toBeDefined()
    expect(screen.getByPlaceholderText("Enter your password")).toBeDefined()
    expect(screen.getByPlaceholderText("Confirm your password")).toBeDefined()
    expect(
      screen.getByRole("button", { name: BUTTON_TEXT.SIGN_UP }),
    ).toBeDefined()
  })

  it("should show loading state while signing up", () => {
    vi.mocked(useRegister).mockReturnValue({
      mutate: mutateMock,
      isPending: true,
      isError: false,
      error: null,
      reset: vi.fn(),
      isSuccess: false,
      status: "pending",
      data: undefined,
    } as any)

    renderInRouter()
    expect(screen.getByText(BUTTON_TEXT.SIGNING_UP)).toBeDefined()
  })

  it("should show error on failure", () => {
    vi.mocked(useRegister).mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      isError: true,
      error: new Error("Email already exists"),
      reset: vi.fn(),
      isSuccess: false,
      status: "error",
      data: undefined,
    } as any)

    renderInRouter()
    expect(screen.getByText("Email already exists")).toBeDefined()
  })

  it("should redirect if already authenticated", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { email: "test@test.com", admin: false, public_id: "user-1" },
      setUser: vi.fn(),
      clearAuth: vi.fn(),
    } as any)
    const { container } = renderInRouter()
    expect(container.querySelector("form")).toBeNull()
  })
})

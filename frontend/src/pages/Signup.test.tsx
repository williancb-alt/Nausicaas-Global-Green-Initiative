import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { Signup } from "./Signup"
import { useRegister } from "../hooks/useAuthHooks"
import { useAuthStore } from "../store/authStore"
import { BUTTON_TEXT } from "../utils/constants"
import {
  mockMutationSuccess,
  mockMutationLoading,
  mockMutationError,
} from "../test/test-utils"

vi.mock("../hooks/useAuthHooks")
vi.mock("../store/authStore")
vi.mock("../features/oauth/OAuthButtons", () => ({
  OAuthButtons: () => null,
}))
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
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      user: null,
      setUser: vi.fn(),
      clearAuth: vi.fn(),
    } as any)
    vi.mocked(useRegister).mockReturnValue(mockMutationSuccess() as any)
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
    vi.mocked(useRegister).mockReturnValue(mockMutationLoading() as any)

    renderInRouter()
    expect(screen.getByText(BUTTON_TEXT.SIGNING_UP)).toBeDefined()
  })

  it("should show error on failure", () => {
    vi.mocked(useRegister).mockReturnValue(
      mockMutationError(new Error("Email already exists")) as any,
    )

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

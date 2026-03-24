import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { ResetPassword } from "./ResetPassword"
import { useResetPassword } from "../hooks/useAuthHooks"
import { BUTTON_TEXT } from "../utils/constants"

vi.mock("../hooks/useAuthHooks")
vi.mock("../components/form/PasswordRequirements", () => ({
  PasswordRequirements: () => <div data-testid="password-reqs" />,
}))

vi.mock("react-router-dom", async importOriginal => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return {
    ...actual,
    useSearchParams: vi.fn(),
  }
})

import { useSearchParams } from "react-router-dom"

const renderInRouter = () =>
  render(
    <MemoryRouter>
      <ResetPassword />
    </MemoryRouter>,
  )

describe("ResetPassword", () => {
  const mutateMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams("token=test-token"),
      vi.fn(),
    ] as any)
    vi.mocked(useResetPassword).mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      reset: vi.fn(),
    } as unknown as ReturnType<typeof useResetPassword>)
  })

  it("should render the reset password form when token is present", () => {
    renderInRouter()
    expect(screen.getByText("Enter your new password.")).toBeDefined()
    expect(screen.getByPlaceholderText("Enter your new password")).toBeDefined()
    expect(
      screen.getByRole("button", { name: BUTTON_TEXT.RESET_PASSWORD }),
    ).toBeDefined()
  })

  it("should show error message when token is missing", () => {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams(""),
      vi.fn(),
    ] as any)

    renderInRouter()
    expect(screen.getByText("Invalid or missing reset link.")).toBeDefined()
    expect(screen.getByText("Request a new reset link")).toBeDefined()
  })

  it("should show success message on success", () => {
    vi.mocked(useResetPassword).mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      isError: false,
      isSuccess: true,
      error: null,
      reset: vi.fn(),
    } as unknown as ReturnType<typeof useResetPassword>)

    renderInRouter()
    expect(
      screen.getByText("Your password has been reset successfully."),
    ).toBeDefined()
    expect(screen.getByText("Sign In")).toBeDefined()
  })

  it("should show loading state while resetting", () => {
    vi.mocked(useResetPassword).mockReturnValue({
      mutate: mutateMock,
      isPending: true,
      isError: false,
      isSuccess: false,
      error: null,
      reset: vi.fn(),
    } as unknown as ReturnType<typeof useResetPassword>)

    renderInRouter()
    expect(screen.getByText(BUTTON_TEXT.RESETTING_PASSWORD)).toBeDefined()
  })
})

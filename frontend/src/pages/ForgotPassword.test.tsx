import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { ForgotPassword } from "./ForgotPassword"
import { useForgotPassword } from "../hooks/useAuthHooks"
import { BUTTON_TEXT } from "../utils/constants"

vi.mock("../hooks/useAuthHooks")

const renderInRouter = () =>
    render(
        <MemoryRouter>
            <ForgotPassword />
        </MemoryRouter>,
    )

describe("ForgotPassword", () => {
    const mutateMock = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useForgotPassword).mockReturnValue({
            mutate: mutateMock,
            isPending: false,
            isError: false,
            error: null,
        } as any)
    })

    it("should render the forgot password form", () => {
        renderInRouter()
        expect(screen.getByText(/Enter your email address/)).toBeDefined()
        expect(screen.getByPlaceholderText("Enter your email")).toBeDefined()
        expect(screen.getByRole("button", { name: BUTTON_TEXT.SEND_RESET_LINK })).toBeDefined()
    })

    it("should show success message after successful submission", async () => {
        mutateMock.mockImplementation((_email, options) => {
            options.onSuccess()
        })

        renderInRouter()

        const emailInput = screen.getByPlaceholderText("Enter your email")
        fireEvent.change(emailInput, { target: { value: "test@example.com" } })

        const submitBtn = screen.getByRole("button")
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(screen.getByText(/a reset link has been sent/)).toBeDefined()
        })
        expect(screen.getByText("Back to Sign In")).toBeDefined()
    })

    it("should show error message on failure", () => {
        vi.mocked(useForgotPassword).mockReturnValue({
            mutate: mutateMock,
            isPending: false,
            isError: true,
            error: new Error("Server error"),
        } as any)

        renderInRouter()
        expect(screen.getByText("Server error")).toBeDefined()
    })

    it("should show loading state while submitting", () => {
        vi.mocked(useForgotPassword).mockReturnValue({
            mutate: mutateMock,
            isPending: true,
            isError: false,
            error: null,
        } as any)

        renderInRouter()
        expect(screen.getByText(BUTTON_TEXT.SENDING_RESET_LINK)).toBeDefined()
    })
})

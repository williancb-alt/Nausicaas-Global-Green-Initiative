import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, Mock } from "vitest"
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
    const mutateMock = vi.fn() as unknown as Mock<ReturnType<typeof useForgotPassword>["mutate"]>

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useForgotPassword).mockReturnValue({
            mutate: mutateMock,
            isPending: false,
            isError: false,
            error: null,
            reset: vi.fn(),
            isSuccess: false,
            status: "idle",
            data: undefined
        } as unknown as ReturnType<typeof useForgotPassword>)
    })

    it("should render the forgot password form", () => {
        renderInRouter()
        expect(screen.getByText(/Enter your email address/)).toBeDefined()
        expect(screen.getByPlaceholderText("Enter your email")).toBeDefined()
        expect(screen.getByRole("button", { name: BUTTON_TEXT.SEND_RESET_LINK })).toBeDefined()
    })

    it("should show success message after successful submission", async () => {
        mutateMock.mockImplementation((_email, options) => {
            options?.onSuccess?.({ status: "success", message: "sent" } as any, _email, undefined, undefined as any)
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
            isSuccess: false,
            status: "error",
            data: undefined,
            error: new Error("Server error"),
            reset: vi.fn()
        } as unknown as ReturnType<typeof useForgotPassword>)

        renderInRouter()
        expect(screen.getByText("Server error")).toBeDefined()
    })

    it("should show loading state while submitting", () => {
        vi.mocked(useForgotPassword).mockReturnValue({
            mutate: mutateMock,
            isPending: true,
            isError: false,
            isSuccess: false,
            status: "loading",
            data: undefined,
            error: null,
            reset: vi.fn()
        } as unknown as ReturnType<typeof useForgotPassword>)

        renderInRouter()
        expect(screen.getByText(BUTTON_TEXT.SENDING_RESET_LINK)).toBeDefined()
    })
})

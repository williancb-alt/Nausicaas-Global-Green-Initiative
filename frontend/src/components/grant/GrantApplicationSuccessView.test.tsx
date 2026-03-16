import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { GrantApplicationSuccessView } from "./GrantApplicationSuccessView"
import * as router from "react-router-dom"

// Mock dependencies
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom")
    return {
        ...actual as any,
        useNavigate: vi.fn(),
    }
})

vi.mock("../button/Button", () => ({
    Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>
}))

describe("GrantApplicationSuccessView", () => {
    const navigateMock = vi.fn()
    const returnHomeMock = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(router.useNavigate).mockReturnValue(navigateMock)
    })

    it("should render success message and grant name", () => {
        render(
            <MemoryRouter>
                <GrantApplicationSuccessView
                    grantName="Green Grant"
                    userEmail="user@test.com"
                    onReturnHome={returnHomeMock}
                />
            </MemoryRouter>
        )
        expect(screen.getByText("Application Submitted")).toBeDefined()
        expect(screen.getByText("Green Grant")).toBeDefined()
        expect(screen.getByText(/user@test.com/)).toBeDefined()
    })

    it("should call onReturnHome when button is clicked", () => {
        render(
            <MemoryRouter>
                <GrantApplicationSuccessView
                    grantName="Green Grant"
                    onReturnHome={returnHomeMock}
                />
            </MemoryRouter>
        )
        fireEvent.click(screen.getByText("Return to Home"))
        expect(returnHomeMock).toHaveBeenCalled()
    })

    it("should navigate to dashboard when button is clicked", () => {
        render(
            <MemoryRouter>
                <GrantApplicationSuccessView
                    grantName="Green Grant"
                    onReturnHome={returnHomeMock}
                />
            </MemoryRouter>
        )
        fireEvent.click(screen.getByText("Go to Dashboard"))
        expect(navigateMock).toHaveBeenCalledWith("/dashboard")
    })
})

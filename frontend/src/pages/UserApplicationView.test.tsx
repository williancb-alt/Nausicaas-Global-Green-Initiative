import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { UserApplicationView } from "./UserApplicationView"
import { useApplication } from "../hooks/useApplicationHooks"
import * as router from "react-router-dom"

// Mock dependencies
vi.mock("../hooks/useApplicationHooks")
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom")
    return {
        ...actual as object,
        useNavigate: vi.fn(),
        useParams: vi.fn(),
    }
})

vi.mock("../components/application/UserApplicationLoadingView", () => ({
    UserApplicationLoadingView: () => <div data-testid="loading-view" />
}))
vi.mock("../components/application/UserApplicationNotFoundView", () => ({
    UserApplicationNotFoundView: ({ onBack }: { onBack: () => void }) => (
        <div data-testid="not-found-view">
            <button onClick={onBack}>Go Back</button>
        </div>
    )
}))
vi.mock("../components/application/UserApplicationDetails", () => ({
    UserApplicationDetails: ({ application, onBack }: { application: { id: number }, onBack: () => void }) => (
        <div data-testid="details-view">
            <span>App ID: {application.id}</span>
            <button onClick={onBack}>Back to Dashboard</button>
        </div>
    )
}))

describe("UserApplicationView Page", () => {
    const navigateMock = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(router.useNavigate).mockReturnValue(navigateMock)
        vi.mocked(router.useParams).mockReturnValue({ id: "1" })
    })

    it("should show loading view when loading", () => {
        vi.mocked(useApplication).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: null
        } as unknown as ReturnType<typeof useApplication>)
        render(<MemoryRouter><UserApplicationView /></MemoryRouter>)
        expect(screen.getByTestId("loading-view")).toBeDefined()
    })

    it("should show not found view when application is missing", () => {
        vi.mocked(useApplication).mockReturnValue({
            data: null as any, // Use any here if necessary to match the 'null' check in component
            isLoading: false,
            isError: false,
            error: null
        } as unknown as ReturnType<typeof useApplication>)
        render(<MemoryRouter><UserApplicationView /></MemoryRouter>)
        expect(screen.getByTestId("not-found-view")).toBeDefined()

        fireEvent.click(screen.getByText("Go Back"))
        expect(navigateMock).toHaveBeenCalledWith("/dashboard")
    })

    it("should show details view when application exists", () => {
        vi.mocked(useApplication).mockReturnValue({
            data: {
                id: 1,
                status: "pending_review",
                submitted_at: "2026-01-01T00:00:00Z",
                submitted_date: "2026-01-01",
                applicant: { email: "user@test.com", public_id: "user-123" },
                grant: { name: "Test Grant", description: "Desc" },
                field_values: {}
            } as any, // Typed as any because I don't want to provide EVERY field if the component doesn't need them all, but I'll provide major ones
            isLoading: false,
            isError: false,
            error: null
        } as unknown as ReturnType<typeof useApplication>)
        render(<MemoryRouter><UserApplicationView /></MemoryRouter>)
        expect(screen.getByTestId("details-view")).toBeDefined()
        expect(screen.getByText("App ID: 1")).toBeDefined()

        fireEvent.click(screen.getByText("Back to Dashboard"))
        expect(navigateMock).toHaveBeenCalledWith("/dashboard")
    })
})

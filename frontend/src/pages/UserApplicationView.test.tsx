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
        ...actual as any,
        useNavigate: vi.fn(),
        useParams: vi.fn(),
    }
})

vi.mock("../components/application/UserApplicationLoadingView", () => ({
    UserApplicationLoadingView: () => <div data-testid="loading-view" />
}))
vi.mock("../components/application/UserApplicationNotFoundView", () => ({
    UserApplicationNotFoundView: ({ onBack }: any) => (
        <div data-testid="not-found-view">
            <button onClick={onBack}>Go Back</button>
        </div>
    )
}))
vi.mock("../components/application/UserApplicationDetails", () => ({
    UserApplicationDetails: ({ application, onBack }: any) => (
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
        vi.mocked(useApplication).mockReturnValue({ data: undefined, isLoading: true } as any)
        render(<MemoryRouter><UserApplicationView /></MemoryRouter>)
        expect(screen.getByTestId("loading-view")).toBeDefined()
    })

    it("should show not found view when application is missing", () => {
        vi.mocked(useApplication).mockReturnValue({ data: null, isLoading: false } as any)
        render(<MemoryRouter><UserApplicationView /></MemoryRouter>)
        expect(screen.getByTestId("not-found-view")).toBeDefined()

        fireEvent.click(screen.getByText("Go Back"))
        expect(navigateMock).toHaveBeenCalledWith("/dashboard")
    })

    it("should show details view when application exists", () => {
        vi.mocked(useApplication).mockReturnValue({ data: { id: 1 }, isLoading: false } as any)
        render(<MemoryRouter><UserApplicationView /></MemoryRouter>)
        expect(screen.getByTestId("details-view")).toBeDefined()
        expect(screen.getByText("App ID: 1")).toBeDefined()

        fireEvent.click(screen.getByText("Back to Dashboard"))
        expect(navigateMock).toHaveBeenCalledWith("/dashboard")
    })
})

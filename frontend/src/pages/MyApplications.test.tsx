import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { MyApplications } from "./MyApplications"
import { useMyApplications } from "../hooks/useApplicationHooks"
import * as router from "react-router-dom"

// Mock dependencies
vi.mock("../hooks/useApplicationHooks")
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom")
    return {
        ...actual as any,
        useNavigate: vi.fn(),
    }
})

vi.mock("../components/application/ApplicationList", () => ({
    ApplicationList: ({ onViewDetails }: any) => (
        <div data-testid="app-list">
            <button onClick={() => onViewDetails(1)}>View App 1</button>
        </div>
    )
}))

describe("MyApplications Page", () => {
    const navigateMock = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(router.useNavigate).mockReturnValue(navigateMock)
        vi.mocked(useMyApplications).mockReturnValue({ data: { items: [] }, isLoading: false, isError: false } as any)
    })

    it("should render page title and list", () => {
        render(<MemoryRouter><MyApplications /></MemoryRouter>)
        expect(screen.getByText("My Applications")).toBeDefined()
        expect(screen.getByTestId("app-list")).toBeDefined()
    })

    it("should navigate to application details on click", () => {
        render(<MemoryRouter><MyApplications /></MemoryRouter>)
        fireEvent.click(screen.getByText("View App 1"))
        expect(navigateMock).toHaveBeenCalledWith("/applications/1")
    })
})

import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { Applications } from "./Applications"
import { useApplications } from "../hooks/useApplicationHooks"
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

vi.mock("../components/table/ApplicationsListTable", () => ({
    ApplicationsListTable: ({ applications, onViewApplication }: any) => (
        <div data-testid="apps-table">
            Table with {applications.length} apps
            <button onClick={() => onViewApplication(1)}>View App 1</button>
        </div>
    )
}))

describe("Applications Page (Admin)", () => {
    const navigateMock = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(router.useNavigate).mockReturnValue(navigateMock)
    })

    it("should show loading state", () => {
        vi.mocked(useApplications).mockReturnValue({ isLoading: true, isError: false } as any)
        render(<MemoryRouter><Applications /></MemoryRouter>)
        expect(screen.getByText("Loading applications...")).toBeDefined()
    })

    it("should show error state", () => {
        vi.mocked(useApplications).mockReturnValue({ isLoading: false, isError: true } as any)
        render(<MemoryRouter><Applications /></MemoryRouter>)
        expect(screen.getByText("Failed to load applications")).toBeDefined()
    })

    it("should show empty state", () => {
        vi.mocked(useApplications).mockReturnValue({ data: { items: [] }, isLoading: false, isError: false } as any)
        render(<MemoryRouter><Applications /></MemoryRouter>)
        expect(screen.getByText("No applications submitted yet.")).toBeDefined()
    })

    it("should render table with applications", () => {
        const mockApps = [{ id: 1 }, { id: 2 }]
        vi.mocked(useApplications).mockReturnValue({ data: { items: mockApps }, isLoading: false, isError: false } as any)

        render(<MemoryRouter><Applications /></MemoryRouter>)
        expect(screen.getByTestId("apps-table")).toBeDefined()
        expect(screen.getByText("Table with 2 apps")).toBeDefined()
        expect(screen.getByText("2 total")).toBeDefined()
    })

    it("should navigate to details on view application", () => {
        const mockApps = [{ id: 1 }]
        vi.mocked(useApplications).mockReturnValue({ data: { items: mockApps }, isLoading: false, isError: false } as any)

        render(<MemoryRouter><Applications /></MemoryRouter>)
        fireEvent.click(screen.getByText("View App 1"))
        expect(navigateMock).toHaveBeenCalledWith("/admin/applications/1")
    })
})

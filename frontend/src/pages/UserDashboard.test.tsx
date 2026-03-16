import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { UserDashboard } from "./UserDashboard"
import { useMyApplications } from "../hooks/useApplicationHooks"
import { useAuthStore } from "../store/authStore"
import { useAdminStats } from "../hooks/useAdminStatsHooks"
import * as router from "react-router-dom"

// Mock dependencies
vi.mock("../hooks/useApplicationHooks")
vi.mock("../store/authStore")
vi.mock("../hooks/useAdminStatsHooks")

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom")
    return {
        ...actual as any,
        useNavigate: vi.fn(),
    }
})

// Mock StatCard to simplify text matching
vi.mock("../components/card/StatsCard", () => ({
    StatCard: ({ label, value }: any) => (
        <div data-testid="stat-card">
            <span>{label}</span>
            <span>{value}</span>
        </div>
    )
}))

const mockApplications = [
    { id: 1, status: "approved", submitted_date: "2026-01-01", grant: { name: "Grant A" } },
    { id: 2, status: "pending_review", submitted_date: "2026-01-02", grant: { name: "Grant B" } }
]

describe("UserDashboard", () => {
    const navigateMock = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(router.useNavigate).mockReturnValue(navigateMock)

        vi.mocked(useAuthStore).mockReturnValue({ user: { email: "test@user.com" } } as any)
        vi.mocked(useMyApplications).mockReturnValue({ data: { items: mockApplications }, isLoading: false } as any)
        vi.mocked(useAdminStats).mockReturnValue({
            stats: { total: 2, approved: 1, pending: 1, rejected: 0 }
        } as any)
    })

    it("should render welcome message and stats", () => {
        render(<MemoryRouter><UserDashboard /></MemoryRouter>)
        expect(screen.getByText(/Welcome back, test/)).toBeDefined()
        expect(screen.getByText("Total Applications")).toBeDefined()
        expect(screen.getByText("2")).toBeDefined()
    })

    it("should show loading state", () => {
        vi.mocked(useMyApplications).mockReturnValue({ data: undefined, isLoading: true } as any)
        render(<MemoryRouter><UserDashboard /></MemoryRouter>)
        expect(screen.getByRole("status")).toBeDefined()
    })

    it("should show empty state when no applications exist", () => {
        vi.mocked(useMyApplications).mockReturnValue({ data: { items: [] }, isLoading: false } as any)
        vi.mocked(useAdminStats).mockReturnValue({
            stats: { total: 0, approved: 0, pending: 0, rejected: 0 }
        } as any)

        render(<MemoryRouter><UserDashboard /></MemoryRouter>)
        expect(screen.getByText(/You haven't submitted any applications yet/)).toBeDefined()
        expect(screen.getByText("Browse Grants")).toBeDefined()
    })

    it("should render the list of applications", () => {
        render(<MemoryRouter><UserDashboard /></MemoryRouter>)
        expect(screen.getByText("Grant A")).toBeDefined()
        expect(screen.getByText("Grant B")).toBeDefined()
        expect(screen.getByText("approved")).toBeDefined()
    })

    it("should navigate to landing page on Start New Application click", () => {
        render(<MemoryRouter><UserDashboard /></MemoryRouter>)
        const applyBtn = screen.getByText("+ Start New Application")
        fireEvent.click(applyBtn)
        expect(navigateMock).toHaveBeenCalledWith("/")
    })

    it("should navigate to details page on View button click", () => {
        render(<MemoryRouter><UserDashboard /></MemoryRouter>)
        const viewButtons = screen.getAllByText("View")
        fireEvent.click(viewButtons[0])
        expect(navigateMock).toHaveBeenCalledWith("/applications/1")
    })
})

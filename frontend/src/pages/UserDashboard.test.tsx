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
        ...actual as object,
        useNavigate: vi.fn(),
    }
})

// Mock StatCard to simplify text matching
vi.mock("../components/card/StatsCard", () => ({
    StatCard: ({ label, value }: { label: string, value: number }) => (
        <div data-testid="stat-card">
            <span>{label}</span>
            <span>{value}</span>
        </div>
    )
}))

import type { Application } from "../types"

const mockApplications: Application[] = [
    {
        id: 1,
        status: "approved",
        submitted_at: "2026-01-01T00:00:00Z",
        submitted_date: "2026-01-01",
        applicant: { email: "test@user.com", public_id: "user-123" },
        grant: { name: "Grant A", description: "Desc A" },
        field_values: {}
    },
    {
        id: 2,
        status: "pending_review",
        submitted_at: "2026-01-02T00:00:00Z",
        submitted_date: "2026-01-02",
        applicant: { email: "test@user.com", public_id: "user-123" },
        grant: { name: "Grant B", description: "Desc B" },
        field_values: {}
    }
]

describe("UserDashboard", () => {
    const navigateMock = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(router.useNavigate).mockReturnValue(navigateMock)

        vi.mocked(useAuthStore).mockReturnValue({
            user: { email: "test@user.com", admin: false, public_id: "user-123" },
            isAuthenticated: true,
            setUser: vi.fn(),
            clearAuth: vi.fn()
        })
        vi.mocked(useMyApplications).mockReturnValue({
            data: {
                items: mockApplications,
                total_items: 2,
                total_pages: 1,
                page: 1,
                has_next: false,
                has_prev: false,
                items_per_page: 10,
                links: { self: "", first: "", last: "" }
            },
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useMyApplications>)
        vi.mocked(useAdminStats).mockReturnValue({
            stats: { total: 2, approved: 1, pending: 1, rejected: 0 },
            statusChartData: [],
            grantWiseData: []
        } as unknown as ReturnType<typeof useAdminStats>)
    })

    it("should render welcome message and stats", () => {
        render(<MemoryRouter><UserDashboard /></MemoryRouter>)
        expect(screen.getByText(/Welcome back, test/)).toBeDefined()
        expect(screen.getByText("Total Applications")).toBeDefined()
        expect(screen.getByText("2")).toBeDefined()
    })

    it("should show loading state", () => {
        vi.mocked(useMyApplications).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false
        } as unknown as ReturnType<typeof useMyApplications>)
        render(<MemoryRouter><UserDashboard /></MemoryRouter>)
        expect(screen.getByRole("status")).toBeDefined()
    })

    it("should show empty state when no applications exist", () => {
        vi.mocked(useMyApplications).mockReturnValue({
            data: {
                items: [],
                total_items: 0,
                total_pages: 0,
                page: 1,
                has_next: false,
                has_prev: false,
                items_per_page: 10,
                links: { self: "", first: "", last: "" }
            },
            isLoading: false,
            isError: false
        } as unknown as ReturnType<typeof useMyApplications>)
        vi.mocked(useAdminStats).mockReturnValue({
            stats: { total: 0, approved: 0, pending: 0, rejected: 0 },
            statusChartData: [],
            grantWiseData: []
        } as unknown as ReturnType<typeof useAdminStats>)

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

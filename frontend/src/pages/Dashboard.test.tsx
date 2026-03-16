import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import Dashboard from "./Dashboard"
import { useAuthStore } from "../store/authStore"
import { useDashboardData } from "../hooks/useDashboardData"
import { api } from "../services/api"

// Mock hooks and API
vi.mock("../store/authStore")
vi.mock("../hooks/useDashboardData")
vi.mock("../services/api", () => ({
    api: {
        auth: {
            logout: vi.fn().mockResolvedValue(undefined),
        },
    },
}))

const defaultData = {
    availableGrants: [],
    myApps: { count: 0 },
    loading: false,
    error: "",
}

describe("Dashboard Page", () => {
    const mockUser = {
        email: "test@example.com",
        public_id: "user-123",
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useAuthStore).mockReturnValue({ user: mockUser } as any)
        // Suppress jsdom navigation warnings
        vi.spyOn(console, "error").mockImplementation(() => { })
    })

    it("should render loading state", () => {
        vi.mocked(useDashboardData).mockReturnValue({
            ...defaultData,
            loading: true,
        })

        render(<Dashboard />)
        expect(screen.getByText("Loading Dashboard...")).toBeDefined()
    })

    it("should render error state", () => {
        vi.mocked(useDashboardData).mockReturnValue({
            ...defaultData,
            error: "Error loading data",
        })

        render(<Dashboard />)
        expect(screen.getByText("Error loading data")).toBeDefined()
    })

    it("should render dashboard with grants", () => {
        vi.mocked(useDashboardData).mockReturnValue({
            availableGrants: [
                {
                    name: "Grant One",
                    deadline: "2026-12-31",
                    deadline_passed: false,
                    time_remaining: "1 year",
                },
            ],
            myApps: { count: 5 },
            loading: false,
            error: "",
        })

        render(<Dashboard />)

        expect(screen.getByText("User Dashboard")).toBeDefined()
        expect(screen.getByText("Grant One")).toBeDefined()
        expect(screen.getByText(/Available Grants:/i)).toBeDefined()
        expect(screen.getByText(/Your Applications:/i)).toBeDefined()
    })

    it("should show empty state when no grants are available", () => {
        vi.mocked(useDashboardData).mockReturnValue(defaultData)

        render(<Dashboard />)
        expect(
            screen.getByText("No grants available right now. Check back later!"),
        ).toBeDefined()
    })

    it("should call logout API when logout button clicked", () => {
        vi.mocked(useDashboardData).mockReturnValue(defaultData)

        render(<Dashboard />)
        const logoutBtn = screen.getByText("Logout")
        fireEvent.click(logoutBtn)

        expect(api.auth.logout).toHaveBeenCalled()
    })
})

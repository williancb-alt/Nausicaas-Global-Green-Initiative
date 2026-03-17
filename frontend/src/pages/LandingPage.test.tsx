import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { LandingPage } from "./LandingPage"
import { useGrants } from "../hooks/useGrantHooks"
import { useAuthStore } from "../store/authStore"
import { useQuery } from "@tanstack/react-query"

// Mock dependencies
vi.mock("../hooks/useGrantHooks")
vi.mock("../store/authStore")
vi.mock("@tanstack/react-query", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-query")>()
    return {
        ...actual,
        useQuery: vi.fn(),
    }
})

vi.mock("../components/grant/GrantList", () => ({
    GrantsList: ({ isLoading, grants }: { isLoading: boolean, grants: unknown[] }) => (
        <div data-testid="grants-list">
            {isLoading ? "Loading..." : `Grants: ${grants.length}`}
        </div>
    )
}))

describe("LandingPage", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useAuthStore).mockReturnValue({
            isAuthenticated: false,
            user: null,
            setUser: vi.fn(),
            clearAuth: vi.fn()
        } as any)
        vi.mocked(useGrants).mockReturnValue({
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
        } as any)
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: null,
            status: "idle",
            fetchStatus: "idle",
            refetch: vi.fn()
        } as any)
    })

    it("should render hero section and grants list", () => {
        render(<MemoryRouter><LandingPage /></MemoryRouter>)
        expect(screen.getByText("Nausicaas Global Green Initiative")).toBeDefined()
        expect(screen.getByTestId("grants-list")).toBeDefined()
    })

    it("should pass grants to GrantsList", () => {
        const mockGrants = [{ name: "Grant 1", description: "D1", deadline: "2026-12-31", deadline_passed: false, time_remaining: "1 year", hidden: false }]
        vi.mocked(useGrants).mockReturnValue({
            data: {
                items: mockGrants as any,
                total_items: 1,
                total_pages: 1,
                page: 1,
                has_next: false,
                has_prev: false,
                items_per_page: 10,
                links: { self: "", first: "", last: "" }
            },
            isLoading: false,
            isError: false
        } as any)

        render(<MemoryRouter><LandingPage /></MemoryRouter>)
        expect(screen.getByText("Grants: 2")).toBeDefined()
    })

    it("should fetch user applications if authenticated", () => {
        vi.mocked(useAuthStore).mockReturnValue({
            isAuthenticated: true,
            user: { email: "test@user.com", admin: false, public_id: "user-1" },
            setUser: vi.fn(),
            clearAuth: vi.fn()
        })
        const mockApps = { items: [{ id: 1, status: "approved", grant: { name: "Grant 1" } }] }
        vi.mocked(useQuery).mockReturnValue({
            data: mockApps,
            isLoading: false,
            isError: false,
            error: null,
            status: "success",
            fetchStatus: "idle",
            refetch: vi.fn()
        } as any)

        render(<MemoryRouter><LandingPage /></MemoryRouter>)

        // useQuery should have been enabled
        const queryCall = vi.mocked(useQuery).mock.calls[0][0]
        expect(queryCall.enabled).toBe(true)
    })
})

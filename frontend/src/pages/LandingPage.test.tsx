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
    GrantsList: ({ isLoading, grants }: any) => (
        <div data-testid="grants-list">
            {isLoading ? "Loading..." : `Grants: ${grants.length}`}
        </div>
    )
}))

describe("LandingPage", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: false } as any)
        vi.mocked(useGrants).mockReturnValue({ data: { items: [] }, isLoading: false, isError: false } as any)
        vi.mocked(useQuery).mockReturnValue({ data: undefined } as any)
    })

    it("should render hero section and grants list", () => {
        render(<MemoryRouter><LandingPage /></MemoryRouter>)
        expect(screen.getByText("Nausicaas Global Green Initiative")).toBeDefined()
        expect(screen.getByTestId("grants-list")).toBeDefined()
    })

    it("should pass grants to GrantsList", () => {
        const mockGrants = [{ name: "Grant 1" }, { name: "Grant 2" }]
        vi.mocked(useGrants).mockReturnValue({ data: { items: mockGrants }, isLoading: false, isError: false } as any)

        render(<MemoryRouter><LandingPage /></MemoryRouter>)
        expect(screen.getByText("Grants: 2")).toBeDefined()
    })

    it("should fetch user applications if authenticated", () => {
        vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: true } as any)
        const mockApps = { items: [{ id: 1, status: "approved", grant: { name: "Grant 1" } }] }
        vi.mocked(useQuery).mockReturnValue({ data: mockApps } as any)

        render(<MemoryRouter><LandingPage /></MemoryRouter>)

        // useQuery should have been enabled
        const queryCall = vi.mocked(useQuery).mock.calls[0][0] as any
        expect(queryCall.enabled).toBe(true)
    })
})

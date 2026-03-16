import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { ProtectedRoute } from "./ProtectedRoute"
import { useUser } from "../../hooks/useAuthHooks"

// Mock dependencies
vi.mock("../../hooks/useAuthHooks")
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom")
    return {
        ...actual as any,
        Navigate: ({ to }: any) => <div data-testid="navigate" data-to={to} />,
    }
})

describe("ProtectedRoute", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("should show loading state", () => {
        vi.mocked(useUser).mockReturnValue({ data: undefined, isLoading: true, isError: false } as any)
        render(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>)
        expect(screen.getByText("Loading...")).toBeDefined()
    })

    it("should redirect to login if not authenticated", () => {
        vi.mocked(useUser).mockReturnValue({ data: null, isLoading: false, isError: false } as any)
        render(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>)
        const nav = screen.getByTestId("navigate")
        expect(nav.getAttribute("data-to")).toBe("/login")
    })

    it("should redirect to login if there is an error", () => {
        vi.mocked(useUser).mockReturnValue({ data: undefined, isLoading: false, isError: true } as any)
        render(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>)
        const nav = screen.getByTestId("navigate")
        expect(nav.getAttribute("data-to")).toBe("/login")
    })

    it("should redirect to home if admin is required but user is not admin", () => {
        vi.mocked(useUser).mockReturnValue({ data: { admin: false }, isLoading: false, isError: false } as any)
        render(<ProtectedRoute requireAdmin={true}><div>Admin Content</div></ProtectedRoute>)
        const nav = screen.getByTestId("navigate")
        expect(nav.getAttribute("data-to")).toBe("/")
    })

    it("should render children if authenticated and admin check passes", () => {
        vi.mocked(useUser).mockReturnValue({ data: { admin: true }, isLoading: false, isError: false } as any)
        render(<ProtectedRoute requireAdmin={true}><div>Admin Content</div></ProtectedRoute>)
        expect(screen.getByText("Admin Content")).toBeDefined()
    })

    it("should render children if authenticated and no admin check required", () => {
        vi.mocked(useUser).mockReturnValue({ data: { admin: false }, isLoading: false, isError: false } as any)
        render(<ProtectedRoute><div>User Content</div></ProtectedRoute>)
        expect(screen.getByText("User Content")).toBeDefined()
    })
})

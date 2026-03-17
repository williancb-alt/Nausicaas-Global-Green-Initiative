import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { Login } from "./Login"
import { useAuthStore } from "../store/authStore"
import { useLogin } from "../hooks/useAuthHooks"

vi.mock("../store/authStore")
vi.mock("../hooks/useAuthHooks")
vi.mock("../features/oauth/OAuthButtons", () => ({
    OAuthButtons: () => null,
}))
vi.mock("react-router-dom", async importOriginal => {
    const actual = await importOriginal<typeof import("react-router-dom")>()
    return {
        ...actual,
        useNavigate: vi.fn(() => vi.fn()),
        useLocation: vi.fn(() => ({ state: null, pathname: "/login" })),
    }
})

const defaultLoginMutation = {
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
    isSuccess: false,
    status: "idle" as const,
    data: undefined
} as any

const renderInRouter = () =>
    render(
        <MemoryRouter>
            <Login />
        </MemoryRouter>,
    )

describe("Login Page", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useAuthStore).mockReturnValue({
            isAuthenticated: false,
            user: null,
            setUser: vi.fn(),
            clearAuth: vi.fn()
        } as any)
        vi.mocked(useLogin).mockReturnValue(defaultLoginMutation)
    })

    it("should render the login form", () => {
        renderInRouter()
        expect(screen.getByPlaceholderText("Enter your email")).toBeDefined()
        expect(screen.getByPlaceholderText("Enter your password")).toBeDefined()
    })

    it("should render the login submit button", () => {
        renderInRouter()
        // Only one submit-type button in form
        expect(screen.getByRole("button", { name: /Sign In/i })).toBeDefined()
    })

    it("should render forgot password link", () => {
        renderInRouter()
        expect(screen.getByText("Forgot password?")).toBeDefined()
    })

    it("should render sign up link", () => {
        renderInRouter()
        expect(screen.getByText(/Sign Up/i)).toBeDefined()
    })

    it("should show loading state when logging in", () => {
        vi.mocked(useLogin).mockReturnValue({
            ...defaultLoginMutation,
            isPending: true,
            status: "loading" as const
        })
        renderInRouter()
        expect(screen.getByRole("button", { name: /Logging in.../i })).toBeDefined()
    })

    it("should show error when login fails", () => {
        vi.mocked(useLogin).mockReturnValue({
            ...defaultLoginMutation,
            isError: true,
            status: "error" as const,
            error: new Error("Invalid credentials"),
        })
        renderInRouter()
        expect(screen.getByText(/Invalid credentials/i)).toBeDefined()
    })

    it("should redirect when already authenticated (admin to /admin)", () => {
        vi.mocked(useAuthStore).mockReturnValue({
            isAuthenticated: true,
            user: { email: "admin@test.com", admin: true, public_id: "admin-1" },
            setUser: vi.fn(),
            clearAuth: vi.fn()
        } as any)
        // Spy on the static store to return admin user
        vi.spyOn(useAuthStore, "getState").mockReturnValue({
            user: { email: "admin@test.com", admin: true, public_id: "admin-1" },
            isAuthenticated: true,
            setUser: vi.fn(),
            clearAuth: vi.fn()
        } as any)
        const { container } = renderInRouter()
        // When redirected, the login form should not be present
        expect(container.querySelector("form")).toBeNull()
    })
})

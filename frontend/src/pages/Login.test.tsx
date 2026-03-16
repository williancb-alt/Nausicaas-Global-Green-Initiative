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
}

const renderInRouter = () =>
    render(
        <MemoryRouter>
            <Login />
        </MemoryRouter>,
    )

describe("Login Page", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: false } as any)
        vi.mocked(useLogin).mockReturnValue(defaultLoginMutation as any)
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
        vi.mocked(useLogin).mockReturnValue({ ...defaultLoginMutation, isPending: true } as any)
        renderInRouter()
        expect(screen.getByRole("button", { name: /Logging in.../i })).toBeDefined()
    })

    it("should show error when login fails", () => {
        vi.mocked(useLogin).mockReturnValue({
            ...defaultLoginMutation,
            isError: true,
            error: new Error("Invalid credentials"),
        } as any)
        renderInRouter()
        expect(screen.getByText(/Invalid credentials/i)).toBeDefined()
    })

    it("should redirect when already authenticated (admin to /admin)", () => {
        vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated: true } as any)
        // Spy on the static store to return admin user
        vi.spyOn(useAuthStore, "getState").mockReturnValue({
            user: { email: "admin@test.com", admin: true },
        } as any)
        const { container } = renderInRouter()
        // When redirected, the login form should not be present
        expect(container.querySelector("form")).toBeNull()
    })
})

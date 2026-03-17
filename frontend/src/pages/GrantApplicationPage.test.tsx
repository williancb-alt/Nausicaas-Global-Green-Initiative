import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, Mock } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { GrantApplicationPage } from "./GrantApplicationPage"
import { useGrant } from "../hooks/useGrantHooks"
import { useSubmitApplication } from "../hooks/useApplicationHooks"
import { useAuthStore } from "../store/authStore"

// Mock dependencies
vi.mock("../hooks/useGrantHooks")
vi.mock("../hooks/useApplicationHooks")
vi.mock("../store/authStore")
vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal<typeof import("react-router-dom")>()
    return {
        ...actual,
        useParams: vi.fn(() => ({ grantName: "Test Grant" })),
        useNavigate: vi.fn(() => vi.fn()),
    }
})

// Mock child components to keep tests focused on the page logic
vi.mock("../components/grant/GrantApplicationLoadingView", () => ({
    GrantApplicationLoadingView: () => <div data-testid="loading-view" />
}))
vi.mock("../components/grant/GrantApplicationErrorView", () => ({
    GrantApplicationErrorView: () => <div data-testid="error-view" />
}))
vi.mock("../components/grant/GrantApplicationSuccessView", () => ({
    GrantApplicationSuccessView: () => <div data-testid="success-view" />
}))
vi.mock("../components/grant/GrantApplicationForm", () => ({
    GrantApplicationForm: ({ onSubmit }: { onSubmit: () => void }) => (
        <div data-testid="app-form">
            <button onClick={onSubmit}>Submit</button>
        </div>
    )
}))

describe("GrantApplicationPage", () => {
    const mutateMock = vi.fn() as unknown as Mock<ReturnType<typeof useSubmitApplication>["mutate"]>

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useAuthStore).mockReturnValue({
            user: { email: "test@test.com", admin: false, public_id: "user-123" },
            isAuthenticated: true,
            setUser: vi.fn(),
            clearAuth: vi.fn()
        })
        vi.mocked(useGrant).mockReturnValue({
            data: {
                name: "Test Grant",
                deadline: "2026-12-31",
                deadline_passed: false,
                time_remaining: "1 year",
                description: "Test Grant Desc"
            },
            isLoading: false,
            isError: false
        } as unknown as ReturnType<typeof useGrant>)
        vi.mocked(useSubmitApplication).mockReturnValue({
            mutate: mutateMock,
            isPending: false,
            isError: false,
            error: null,
            reset: vi.fn()
        } as unknown as ReturnType<typeof useSubmitApplication>)
    })

    it("should render the loading view when loading", () => {
        vi.mocked(useGrant).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false
        } as unknown as ReturnType<typeof useGrant>)
        render(<MemoryRouter><GrantApplicationPage /></MemoryRouter>)
        expect(screen.getByTestId("loading-view")).toBeDefined()
    })

    it("should render the error view when grant is not found or error occurs", () => {
        vi.mocked(useGrant).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true
        } as unknown as ReturnType<typeof useGrant>)
        render(<MemoryRouter><GrantApplicationPage /></MemoryRouter>)
        expect(screen.getByTestId("error-view")).toBeDefined()
    })

    it("should render the application form by default", () => {
        render(<MemoryRouter><GrantApplicationPage /></MemoryRouter>)
        expect(screen.getByTestId("app-form")).toBeDefined()
    })

    it("should show success view after successful submission", () => {
        mutateMock.mockImplementation((_data, options) => {
            options?.onSuccess?.({ status: "success", message: "created", application_id: 1 } as any, _data, undefined, undefined as any)
        })

        render(<MemoryRouter><GrantApplicationPage /></MemoryRouter>)
        fireEvent.click(screen.getByText("Submit"))

        expect(screen.getByTestId("success-view")).toBeDefined()
    })

    it("should call mutate with correct arguments on submit", () => {
        render(<MemoryRouter><GrantApplicationPage /></MemoryRouter>)
        fireEvent.click(screen.getByText("Submit"))

        expect(mutateMock).toHaveBeenCalledWith(
            { grantName: "Test Grant", fieldValues: {} },
            expect.any(Object)
        )
    })
})

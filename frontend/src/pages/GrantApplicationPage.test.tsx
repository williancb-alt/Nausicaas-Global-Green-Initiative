import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
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
    GrantApplicationForm: ({ onSubmit }: any) => (
        <div data-testid="app-form">
            <button onClick={onSubmit}>Submit</button>
        </div>
    )
}))

describe("GrantApplicationPage", () => {
    const mutateMock = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useAuthStore).mockReturnValue({ user: { email: "test@test.com" } } as any)
        vi.mocked(useGrant).mockReturnValue({ data: { name: "Test Grant" }, isLoading: false, isError: false } as any)
        vi.mocked(useSubmitApplication).mockReturnValue({ mutate: mutateMock, isPending: false } as any)
    })

    it("should render the loading view when loading", () => {
        vi.mocked(useGrant).mockReturnValue({ data: undefined, isLoading: true, isError: false } as any)
        render(<MemoryRouter><GrantApplicationPage /></MemoryRouter>)
        expect(screen.getByTestId("loading-view")).toBeDefined()
    })

    it("should render the error view when grant is not found or error occurs", () => {
        vi.mocked(useGrant).mockReturnValue({ data: undefined, isLoading: false, isError: true } as any)
        render(<MemoryRouter><GrantApplicationPage /></MemoryRouter>)
        expect(screen.getByTestId("error-view")).toBeDefined()
    })

    it("should render the application form by default", () => {
        render(<MemoryRouter><GrantApplicationPage /></MemoryRouter>)
        expect(screen.getByTestId("app-form")).toBeDefined()
    })

    it("should show success view after successful submission", () => {
        mutateMock.mockImplementation((_data, options) => {
            options.onSuccess()
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

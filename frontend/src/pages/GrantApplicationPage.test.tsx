import { screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { GrantApplicationPage } from "./GrantApplicationPage"
import { useGrant } from "../hooks/useGrantHooks"
import { useSubmitApplication } from "../hooks/useApplicationHooks"
import { useAuthStore } from "../store/authStore"

import { mockUser, mockGrant } from "../test/mock-data"
import { mockMutationSuccess, renderWithProviders } from "../test/test-utils"

// Mock dependencies
vi.mock("../hooks/useGrantHooks")
vi.mock("../hooks/useApplicationHooks")
vi.mock("../store/authStore")
vi.mock("react-router-dom", async importOriginal => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return {
    ...actual,
    useParams: vi.fn(() => ({ grantName: "Test Grant" })),
    useNavigate: vi.fn(() => vi.fn()),
  }
})

// Mock child components to keep tests focused on the page logic
vi.mock("../components/grant/GrantApplicationLoadingView", () => ({
  GrantApplicationLoadingView: () => <div data-testid="loading-view" />,
}))
vi.mock("../components/grant/GrantApplicationErrorView", () => ({
  GrantApplicationErrorView: () => <div data-testid="error-view" />,
}))
vi.mock("../components/grant/GrantApplicationSuccessView", () => ({
  GrantApplicationSuccessView: () => <div data-testid="success-view" />,
}))
vi.mock("../components/grant/GrantApplicationForm", () => ({
  GrantApplicationForm: ({ onSubmit }: { onSubmit: () => void }) => (
    <div data-testid="app-form">
      <button onClick={onSubmit}>Submit</button>
    </div>
  ),
}))

describe("GrantApplicationPage", () => {
  const mutateMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      setUser: vi.fn(),
      clearAuth: vi.fn(),
    } as any)
    vi.mocked(useGrant).mockReturnValue({
      data: mockGrant,
      isLoading: false,
      isError: false,
    } as any)
    vi.mocked(useSubmitApplication).mockReturnValue({
      ...mockMutationSuccess(),
      mutate: mutateMock,
    } as any)
  })

  it("should render the loading view when loading", () => {
    vi.mocked(useGrant).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useGrant>)
    renderWithProviders(<GrantApplicationPage />)
    expect(screen.getByTestId("loading-view")).toBeDefined()
  })

  it("should render the error view when grant is not found or error occurs", () => {
    vi.mocked(useGrant).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useGrant>)
    renderWithProviders(<GrantApplicationPage />)
    expect(screen.getByTestId("error-view")).toBeDefined()
  })

  it("should render the application form by default", () => {
    renderWithProviders(<GrantApplicationPage />)
    expect(screen.getByTestId("app-form")).toBeDefined()
  })

  it("should show success view after successful submission", () => {
    mutateMock.mockImplementation((_data, options) => {
      options?.onSuccess?.(
        { status: "success", message: "created", application_id: 1 } as any,
        _data,
        undefined,
        undefined as any,
      )
    })

    renderWithProviders(<GrantApplicationPage />)
    fireEvent.click(screen.getByText("Submit"))

    expect(screen.getByTestId("success-view")).toBeDefined()
  })

  it("should call mutate with correct arguments on submit", () => {
    renderWithProviders(<GrantApplicationPage />)
    fireEvent.click(screen.getByText("Submit"))

    expect(mutateMock).toHaveBeenCalledWith(
      { grantName: "Test Grant", fieldValues: {} },
      expect.any(Object),
    )
  })
})

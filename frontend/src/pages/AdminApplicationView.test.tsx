import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query"
import { AdminApplicationView } from "./AdminApplicationView"
import type { Application } from "../types"

// Mock the hooks
vi.mock("../hooks/useApplicationHooks", () => ({
  useApplication: vi.fn(),
  useUpdateApplication: vi.fn(),
}))

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useParams: () => ({ id: "1" }),
    useNavigate: () => vi.fn(),
  }
})

// Import mocked hooks
import {
  useApplication,
  useUpdateApplication,
} from "../hooks/useApplicationHooks"

type UpdateApplicationParams = {
  applicationId: string
  status?: string
  feedback?: string
}

type UpdateApplicationResponse = {
  status: string
  message: string
}

type UpdateMutationResult = UseMutationResult<
  UpdateApplicationResponse,
  Error,
  UpdateApplicationParams,
  unknown
>

function mockUseApplicationReturn(
  overrides: Partial<UseQueryResult<Application, Error>>,
): UseQueryResult<Application, Error> {
  return {
    data: undefined,
    error: null,
    isError: false,
    isLoading: false,
    isLoadingError: false,
    isRefetchError: false,
    isPending: false,
    isSuccess: true,
    status: "success",
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isInitialLoading: false,
    isPaused: false,
    isPlaceholderData: false,
    isRefetching: false,
    isStale: false,
    refetch: vi.fn(),
    fetchStatus: "idle",
    promise: Promise.resolve({} as Application),
    ...overrides,
  } as UseQueryResult<Application, Error>
}

function mockUseUpdateApplicationReturn(
  overrides: Partial<UpdateMutationResult>,
): UpdateMutationResult {
  return {
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    data: undefined,
    error: null,
    isError: false,
    isIdle: true,
    isPending: false,
    isSuccess: false,
    status: "idle",
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    reset: vi.fn(),
    submittedAt: 0,
    ...overrides,
  } as UpdateMutationResult
}

const mockApplication: Application = {
  id: 1,
  status: "pending_review",
  submitted_at: "2024-01-15T00:00:00Z",
  submitted_date: "2024-01-15",
  grant: {
    name: "Environmental Research Grant",
    custom_fields: {
      configs: [{ type: "text", label: "Organization Name", maxLength: 255 }],
    },
  },
  applicant: {
    email: "applicant@example.com",
    public_id: "user-1",
  },
  field_values: {
    field_0: "Green Initiative Inc",
  },
  feedback: undefined,
}

describe("AdminApplicationView", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AdminApplicationView />
        </BrowserRouter>
      </QueryClientProvider>,
    )
  }

  it("renders loading state", () => {
    vi.mocked(useApplication).mockReturnValue(
      mockUseApplicationReturn({
        data: undefined,
        isLoading: true,
        isPending: true,
        isSuccess: false,
        status: "pending",
        fetchStatus: "fetching",
        isFetching: true,
        isFetched: false,
        isFetchedAfterMount: false,
      }),
    )
    vi.mocked(useUpdateApplication).mockReturnValue(
      mockUseUpdateApplicationReturn({ mutate: vi.fn() }),
    )

    renderComponent()
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("renders application details correctly", () => {
    vi.mocked(useApplication).mockReturnValue(
      mockUseApplicationReturn({ data: mockApplication, isLoading: false }),
    )
    vi.mocked(useUpdateApplication).mockReturnValue(
      mockUseUpdateApplicationReturn({ mutate: vi.fn() }),
    )

    renderComponent()

    expect(screen.getByText(/Application #1/)).toBeInTheDocument()
    expect(screen.getByText(/Environmental Research Grant/)).toBeInTheDocument()
    expect(screen.getByText(/applicant@example.com/)).toBeInTheDocument()
    expect(screen.getByText(/2024-01-15/)).toBeInTheDocument()
    expect(screen.getByText(/Green Initiative Inc/)).toBeInTheDocument()
  })

  it("displays status badge with correct styling for pending_review", () => {
    vi.mocked(useApplication).mockReturnValue(
      mockUseApplicationReturn({ data: mockApplication, isLoading: false }),
    )
    vi.mocked(useUpdateApplication).mockReturnValue(
      mockUseUpdateApplicationReturn({ mutate: vi.fn() }),
    )

    renderComponent()

    const badge = screen.getByText("pending review")
    expect(badge).toHaveClass("badge", "bg-warning")
  })

  it("displays status badge with correct styling for approved", () => {
    vi.mocked(useApplication).mockReturnValue(
      mockUseApplicationReturn({
        data: { ...mockApplication, status: "approved" },
        isLoading: false,
      }),
    )
    vi.mocked(useUpdateApplication).mockReturnValue(
      mockUseUpdateApplicationReturn({ mutate: vi.fn() }),
    )

    renderComponent()

    const badge = screen.getByText("approved")
    expect(badge).toHaveClass("badge", "bg-success")
  })

  it("displays status badge with correct styling for denied", () => {
    vi.mocked(useApplication).mockReturnValue(
      mockUseApplicationReturn({
        data: { ...mockApplication, status: "denied" },
        isLoading: false,
      }),
    )
    vi.mocked(useUpdateApplication).mockReturnValue(
      mockUseUpdateApplicationReturn({ mutate: vi.fn() }),
    )

    renderComponent()

    const badge = screen.getByText("denied")
    expect(badge).toHaveClass("badge", "bg-danger")
  })

  it("calls approve mutation when Approve button is clicked", async () => {
    const mutateFn = vi.fn(
      (
        _params: UpdateApplicationParams,
        callbacks?: { onSuccess?: () => void; onError?: () => void },
      ) => {
        callbacks?.onSuccess?.()
      },
    ) as unknown as UpdateMutationResult["mutate"]

    vi.mocked(useApplication).mockReturnValue(
      mockUseApplicationReturn({ data: mockApplication, isLoading: false }),
    )
    vi.mocked(useUpdateApplication).mockReturnValue(
      mockUseUpdateApplicationReturn({ mutate: mutateFn }),
    )

    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})

    renderComponent()

    const approveButton = screen.getByRole("button", { name: /Approve/i })
    fireEvent.click(approveButton)

    await waitFor(() => {
      expect(mutateFn).toHaveBeenCalledWith(
        { applicationId: "1", status: "approved" },
        expect.any(Object),
      )
    })

    expect(alertSpy).toHaveBeenCalledWith("Application approved successfully!")
    alertSpy.mockRestore()
  })

  it("calls deny mutation when Deny button is clicked", async () => {
    const mutateFn = vi.fn(
      (
        _params: UpdateApplicationParams,
        callbacks?: { onSuccess?: () => void; onError?: () => void },
      ) => {
        callbacks?.onSuccess?.()
      },
    ) as unknown as UpdateMutationResult["mutate"]

    vi.mocked(useApplication).mockReturnValue(
      mockUseApplicationReturn({ data: mockApplication, isLoading: false }),
    )
    vi.mocked(useUpdateApplication).mockReturnValue(
      mockUseUpdateApplicationReturn({ mutate: mutateFn }),
    )

    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})

    renderComponent()

    const denyButton = screen.getByRole("button", { name: /Deny/i })
    fireEvent.click(denyButton)

    await waitFor(() => {
      expect(mutateFn).toHaveBeenCalledWith(
        { applicationId: "1", status: "denied" },
        expect.any(Object),
      )
    })

    expect(alertSpy).toHaveBeenCalledWith("Application denied successfully!")
    alertSpy.mockRestore()
  })

  it("disables Approve button when application is already approved", () => {
    vi.mocked(useApplication).mockReturnValue(
      mockUseApplicationReturn({
        data: { ...mockApplication, status: "approved" },
        isLoading: false,
      }),
    )
    vi.mocked(useUpdateApplication).mockReturnValue(
      mockUseUpdateApplicationReturn({ mutate: vi.fn() }),
    )

    renderComponent()

    const approveButton = screen.getByRole("button", { name: /✓ Approved/i })
    expect(approveButton).toBeDisabled()
  })

  it("disables Deny button when application is already denied", () => {
    vi.mocked(useApplication).mockReturnValue(
      mockUseApplicationReturn({
        data: { ...mockApplication, status: "denied" },
        isLoading: false,
      }),
    )
    vi.mocked(useUpdateApplication).mockReturnValue(
      mockUseUpdateApplicationReturn({ mutate: vi.fn() }),
    )

    renderComponent()

    const denyButton = screen.getByRole("button", { name: /✗ Denied/i })
    expect(denyButton).toBeDisabled()
  })

  it("displays feedback when present", () => {
    vi.mocked(useApplication).mockReturnValue(
      mockUseApplicationReturn({
        data: {
          ...mockApplication,
          feedback: "Please provide more details about your budget",
        },
        isLoading: false,
      }),
    )
    vi.mocked(useUpdateApplication).mockReturnValue(
      mockUseUpdateApplicationReturn({ mutate: vi.fn() }),
    )

    renderComponent()

    expect(
      screen.getByText(/Please provide more details about your budget/),
    ).toBeInTheDocument()
  })

  it("shows error message when application is not found", () => {
    vi.mocked(useApplication).mockReturnValue(
      mockUseApplicationReturn({
        data: undefined,
        isLoading: false,
      }),
    )
    vi.mocked(useUpdateApplication).mockReturnValue(
      mockUseUpdateApplicationReturn({ mutate: vi.fn() }),
    )

    renderComponent()

    expect(screen.getByText("Application not found")).toBeInTheDocument()
  })
})

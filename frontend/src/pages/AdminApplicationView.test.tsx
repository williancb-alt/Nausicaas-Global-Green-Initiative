import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type {
  UseQueryResult,
  UseMutationResult,
  MutationFunctionContext,
} from "@tanstack/react-query"
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

  it.each([
    ["pending_review", "pending review", "badge", "bg-warning"],
    ["approved", "approved", "badge", "bg-success"],
    ["denied", "denied", "badge", "bg-danger"],
  ] as const)(
    "displays status badge for %s",
    (status, expectedText, ...expectedClasses) => {
      vi.mocked(useApplication).mockReturnValue(
        mockUseApplicationReturn({
          data: { ...mockApplication, status },
          isLoading: false,
        }),
      )
      vi.mocked(useUpdateApplication).mockReturnValue(
        mockUseUpdateApplicationReturn({ mutate: vi.fn() }),
      )
      renderComponent()
      const badge = screen.getByText(expectedText)
      expect(badge).toHaveClass(...expectedClasses)
    },
  )

  it.each([
    ["Approve", "approved", "Application approved successfully!"],
    ["Deny", "denied", "Application denied successfully!"],
  ] as const)(
    "calls %s mutation when button is clicked",
    async (buttonName, status, alertMessage) => {
      const mutateFn = vi.fn<UpdateMutationResult["mutate"]>(
        (_params, callbacks) => {
          callbacks?.onSuccess?.(
            {
              status: "success",
              message: "Success",
            } as UpdateApplicationResponse,
            _params,
            undefined,
            {} as MutationFunctionContext,
          )
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
      fireEvent.click(
        screen.getByRole("button", { name: new RegExp(buttonName, "i") }),
      )
      await waitFor(() =>
        expect(mutateFn).toHaveBeenCalledWith(
          { applicationId: "1", status },
          expect.any(Object),
        ),
      )
      expect(alertSpy).toHaveBeenCalledWith(alertMessage)
      alertSpy.mockRestore()
    },
  )

  it.each([
    ["approved", /✓ Approved/i],
    ["denied", /✗ Denied/i],
  ] as const)(
    "disables correct button when application is %s",
    (status, buttonName) => {
      vi.mocked(useApplication).mockReturnValue(
        mockUseApplicationReturn({
          data: { ...mockApplication, status },
          isLoading: false,
        }),
      )
      vi.mocked(useUpdateApplication).mockReturnValue(
        mockUseUpdateApplicationReturn({ mutate: vi.fn() }),
      )
      renderComponent()
      expect(screen.getByRole("button", { name: buttonName })).toBeDisabled()
    },
  )

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

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AdminApplicationView } from "./AdminApplicationView"

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
import { useApplication, useUpdateApplication } from "../hooks/useApplicationHooks"

const mockApplication = {
  id: 1,
  status: "pending_review",
  submitted_date: "2024-01-15",
  grant: {
    name: "Environmental Research Grant",
    custom_fields: {
      configs: [{ label: "Organization Name" }],
    },
  },
  applicant: {
    email: "applicant@example.com",
  },
  field_values: {
    field_0: "Green Initiative Inc",
  },
  feedback: null,
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
      </QueryClientProvider>
    )
  }

  it("renders loading state", () => {
    vi.mocked(useApplication).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any)
    vi.mocked(useUpdateApplication).mockReturnValue({
      mutate: vi.fn(),
    } as any)

    renderComponent()
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("renders application details correctly", () => {
    vi.mocked(useApplication).mockReturnValue({
      data: mockApplication,
      isLoading: false,
    } as any)
    vi.mocked(useUpdateApplication).mockReturnValue({
      mutate: vi.fn(),
    } as any)

    renderComponent()

    expect(screen.getByText(/Application #1/)).toBeInTheDocument()
    expect(screen.getByText(/Environmental Research Grant/)).toBeInTheDocument()
    expect(screen.getByText(/applicant@example.com/)).toBeInTheDocument()
    expect(screen.getByText(/2024-01-15/)).toBeInTheDocument()
    expect(screen.getByText(/Green Initiative Inc/)).toBeInTheDocument()
  })

  it("displays status badge with correct styling for pending_review", () => {
    vi.mocked(useApplication).mockReturnValue({
      data: mockApplication,
      isLoading: false,
    } as any)
    vi.mocked(useUpdateApplication).mockReturnValue({
      mutate: vi.fn(),
    } as any)

    renderComponent()

    const badge = screen.getByText("pending review")
    expect(badge).toHaveClass("badge", "bg-warning")
  })

  it("displays status badge with correct styling for approved", () => {
    vi.mocked(useApplication).mockReturnValue({
      data: { ...mockApplication, status: "approved" },
      isLoading: false,
    } as any)
    vi.mocked(useUpdateApplication).mockReturnValue({
      mutate: vi.fn(),
    } as any)

    renderComponent()

    const badge = screen.getByText("approved")
    expect(badge).toHaveClass("badge", "bg-success")
  })

  it("displays status badge with correct styling for denied", () => {
    vi.mocked(useApplication).mockReturnValue({
      data: { ...mockApplication, status: "denied" },
      isLoading: false,
    } as any)
    vi.mocked(useUpdateApplication).mockReturnValue({
      mutate: vi.fn(),
    } as any)

    renderComponent()

    const badge = screen.getByText("denied")
    expect(badge).toHaveClass("badge", "bg-danger")
  })

  it("calls approve mutation when Approve button is clicked", async () => {
    const mutateFn = vi.fn((_params, callbacks) => {
      callbacks?.onSuccess?.()
    })
    vi.mocked(useApplication).mockReturnValue({
      data: mockApplication,
      isLoading: false,
    } as any)
    vi.mocked(useUpdateApplication).mockReturnValue({
      mutate: mutateFn,
    } as any)

    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})

    renderComponent()

    const approveButton = screen.getByRole("button", { name: /Approve/i })
    fireEvent.click(approveButton)

    await waitFor(() => {
      expect(mutateFn).toHaveBeenCalledWith(
        { applicationId: "1", status: "approved" },
        expect.any(Object)
      )
    })

    expect(alertSpy).toHaveBeenCalledWith("Application approved successfully!")
    alertSpy.mockRestore()
  })

  it("calls deny mutation when Deny button is clicked", async () => {
    const mutateFn = vi.fn((_params, callbacks) => {
      callbacks?.onSuccess?.()
    })
    vi.mocked(useApplication).mockReturnValue({
      data: mockApplication,
      isLoading: false,
    } as any)
    vi.mocked(useUpdateApplication).mockReturnValue({
      mutate: mutateFn,
    } as any)

    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})

    renderComponent()

    const denyButton = screen.getByRole("button", { name: /Deny/i })
    fireEvent.click(denyButton)

    await waitFor(() => {
      expect(mutateFn).toHaveBeenCalledWith(
        { applicationId: "1", status: "denied" },
        expect.any(Object)
      )
    })

    expect(alertSpy).toHaveBeenCalledWith("Application denied successfully!")
    alertSpy.mockRestore()
  })

  it("disables Approve button when application is already approved", () => {
    vi.mocked(useApplication).mockReturnValue({
      data: { ...mockApplication, status: "approved" },
      isLoading: false,
    } as any)
    vi.mocked(useUpdateApplication).mockReturnValue({
      mutate: vi.fn(),
    } as any)

    renderComponent()

    const approveButton = screen.getByRole("button", { name: /✓ Approved/i })
    expect(approveButton).toBeDisabled()
  })

  it("disables Deny button when application is already denied", () => {
    vi.mocked(useApplication).mockReturnValue({
      data: { ...mockApplication, status: "denied" },
      isLoading: false,
    } as any)
    vi.mocked(useUpdateApplication).mockReturnValue({
      mutate: vi.fn(),
    } as any)

    renderComponent()

    const denyButton = screen.getByRole("button", { name: /✗ Denied/i })
    expect(denyButton).toBeDisabled()
  })

  it("displays feedback when present", () => {
    vi.mocked(useApplication).mockReturnValue({
      data: {
        ...mockApplication,
        feedback: "Please provide more details about your budget",
      },
      isLoading: false,
    } as any)
    vi.mocked(useUpdateApplication).mockReturnValue({
      mutate: vi.fn(),
    } as any)

    renderComponent()

    expect(screen.getByText(/Please provide more details about your budget/)).toBeInTheDocument()
  })

  it("shows error message when application is not found", () => {
    vi.mocked(useApplication).mockReturnValue({
      data: null,
      isLoading: false,
    } as any)
    vi.mocked(useUpdateApplication).mockReturnValue({
      mutate: vi.fn(),
    } as any)

    renderComponent()

    expect(screen.getByText("Application not found")).toBeInTheDocument()
  })
})

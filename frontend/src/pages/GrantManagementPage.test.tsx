import { render, screen, fireEvent, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { GrantManagementPage } from "./GrantManagementPage"
import { useGrantsStore } from "../store/grantsStore"
import { EMPTY_PAGINATED_RESPONSE } from "../test/mock-data"
import { mockMutationSuccess, mockMutationLoading } from "../test/test-utils"

// Mock the hooks
vi.mock("../hooks/useGrantHooks", () => ({
  useGrants: vi.fn(),
  useCreateGrant: vi.fn(),
  useUpdateGrant: vi.fn(),
  useDeleteGrant: vi.fn(),
}))

vi.mock("../store/grantsStore", () => ({
  useGrantsStore: vi.fn(),
}))

// Import mocked hooks
import {
  useGrants,
  useCreateGrant,
  useUpdateGrant,
  useDeleteGrant,
} from "../hooks/useGrantHooks"

const mockGrants = {
  ...EMPTY_PAGINATED_RESPONSE,
  items: [
    {
      name: "visible-grant",
      description: "A visible grant",
      deadline: "2024-12-31",
      deadline_passed: false,
      time_remaining: "30 days",
      hidden: false,
    },
    {
      name: "hidden-grant",
      description: "A hidden grant",
      deadline: "2024-12-31",
      deadline_passed: false,
      time_remaining: "30 days",
      hidden: true,
    },
  ],
  total_items: 2,
  links: {
    self: "/api/v1/grants?page=1",
    first: "/api/v1/grants?page=1",
    last: "/api/v1/grants?page=1",
  },
}

function mockAllHooks() {
  vi.mocked(useGrants).mockReturnValue({
    data: mockGrants,
    isLoading: false,
    isError: false,
  } as any)
  vi.mocked(useCreateGrant).mockReturnValue(mockMutationSuccess() as any)
  vi.mocked(useUpdateGrant).mockReturnValue(mockMutationSuccess() as any)
  vi.mocked(useDeleteGrant).mockReturnValue(mockMutationSuccess() as any)
}

describe("GrantManagementPage", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()

    vi.mocked(useGrantsStore).mockReturnValue({
      currentPage: 1,
      itemsPerPage: 10,
      setCurrentPage: vi.fn(),
      setItemsPerPage: vi.fn(),
      reset: vi.fn(),
    } as any)
    mockAllHooks()
  })

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <GrantManagementPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )
  }

  it("should render grant management page with grants", () => {
    renderComponent()
    expect(screen.getByText("Grant Management")).toBeDefined()
    expect(screen.getByText("visible-grant")).toBeDefined()
  })

  it("should display correct visibility badges", () => {
    renderComponent()
    expect(screen.getByText("Visible")).toBeDefined()
    expect(screen.getByText("Hidden")).toBeDefined()
  })

  it("should toggle visibility when hide button is clicked", () => {
    const updateMutate = vi.fn()
    vi.mocked(useUpdateGrant).mockReturnValue({
      ...mockMutationSuccess(),
      mutate: updateMutate,
    } as any)

    renderComponent()

    const hideButton = screen.getByTitle("Hide grant")
    act(() => {
      fireEvent.click(hideButton)
    })

    expect(updateMutate).toHaveBeenCalledWith(
      expect.objectContaining({ name: "visible-grant", hidden: true }),
      expect.any(Object),
    )
  })

  it("should show loading indicator while toggling", () => {
    // We mock mutate to do nothing (stay pending)
    const updateMutate = vi.fn()
    vi.mocked(useUpdateGrant).mockReturnValue({
      ...mockMutationLoading(),
      mutate: updateMutate,
    } as any)

    renderComponent()

    const hideButton = screen.getByTitle("Hide grant")
    act(() => {
      fireEvent.click(hideButton)
    })

    expect(screen.getByText("...")).toBeDefined()
  })

  it("should show error alert when toggle fails", () => {
    const updateMutate = vi.fn(
      (
        _data: { name: string; hidden: boolean },
        options?: { onError?: (err: Error) => void },
      ) => {
        options?.onError?.(new Error("Network Error"))
      },
    )
    vi.mocked(useUpdateGrant).mockReturnValue({
      ...mockMutationSuccess(),
      mutate: updateMutate as any,
    } as any)
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})

    renderComponent()

    const hideButton = screen.getByTitle("Hide grant")
    act(() => {
      fireEvent.click(hideButton)
    })

    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to toggle visibility: Network Error"),
    )
    alertSpy.mockRestore()
  })
})

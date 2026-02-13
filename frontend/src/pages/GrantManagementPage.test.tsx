import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { GrantManagementPage } from "./GrantManagementPage"

// Mock the hooks
vi.mock("../hooks/useGrantHooks", () => ({
  useGrants: vi.fn(),
  useCreateGrant: vi.fn(),
  useUpdateGrant: vi.fn(),
  useDeleteGrant: vi.fn(),
}))

vi.mock("../store/grantsStore", () => ({
  useGrantsStore: () => ({
    setCurrentPage: vi.fn(),
  }),
}))

// Import mocked hooks
import { useGrants, useCreateGrant, useUpdateGrant, useDeleteGrant } from "../hooks/useGrantHooks"

const mockGrants = {
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
  page: 1,
  total_pages: 1,
}

describe("GrantManagementPage - Visibility Toggle", () => {
  let queryClient: QueryClient
  let updateGrantMutate: any

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    updateGrantMutate = vi.fn()
    vi.clearAllMocks()
  })

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <GrantManagementPage />
        </BrowserRouter>
      </QueryClientProvider>
    )
  }

  it("displays visibility badge as Visible for non-hidden grant", () => {
    vi.mocked(useGrants).mockReturnValue({
      data: mockGrants,
      isLoading: false,
    } as any)
    vi.mocked(useCreateGrant).mockReturnValue({ mutate: vi.fn() } as any)
    vi.mocked(useUpdateGrant).mockReturnValue({ mutate: updateGrantMutate } as any)
    vi.mocked(useDeleteGrant).mockReturnValue({ mutate: vi.fn() } as any)

    renderComponent()

    const badges = screen.getAllByText("Visible")
    expect(badges[0]).toBeInTheDocument()
    expect(badges[0]).toHaveClass("badge")
  })

  it("displays visibility badge as Hidden for hidden grant", () => {
    vi.mocked(useGrants).mockReturnValue({
      data: mockGrants,
      isLoading: false,
    } as any)
    vi.mocked(useCreateGrant).mockReturnValue({ mutate: vi.fn() } as any)
    vi.mocked(useUpdateGrant).mockReturnValue({ mutate: updateGrantMutate } as any)
    vi.mocked(useDeleteGrant).mockReturnValue({ mutate: vi.fn() } as any)

    renderComponent()

    const hiddenBadge = screen.getByText("Hidden")
    expect(hiddenBadge).toBeInTheDocument()
    expect(hiddenBadge).toHaveClass("badge")
  })

  it("shows Eye icon for visible grant", () => {
    vi.mocked(useGrants).mockReturnValue({
      data: mockGrants,
      isLoading: false,
    } as any)
    vi.mocked(useCreateGrant).mockReturnValue({ mutate: vi.fn() } as any)
    vi.mocked(useUpdateGrant).mockReturnValue({ mutate: updateGrantMutate } as any)
    vi.mocked(useDeleteGrant).mockReturnValue({ mutate: vi.fn() } as any)

    renderComponent()

    // Find the button with title "Hide grant"
    const hideButton = screen.getByTitle("Hide grant")
    expect(hideButton).toBeInTheDocument()
  })

  it("shows EyeOff icon for hidden grant", () => {
    vi.mocked(useGrants).mockReturnValue({
      data: mockGrants,
      isLoading: false,
    } as any)
    vi.mocked(useCreateGrant).mockReturnValue({ mutate: vi.fn() } as any)
    vi.mocked(useUpdateGrant).mockReturnValue({ mutate: updateGrantMutate } as any)
    vi.mocked(useDeleteGrant).mockReturnValue({ mutate: vi.fn() } as any)

    renderComponent()

    // Find the button with title "Show grant"
    const showButton = screen.getByTitle("Show grant")
    expect(showButton).toBeInTheDocument()
  })

  it("calls updateGrant with hidden=true when hiding a visible grant", async () => {
    updateGrantMutate = vi.fn((_params, callbacks) => {
      callbacks?.onSuccess?.()
    })

    vi.mocked(useGrants).mockReturnValue({
      data: mockGrants,
      isLoading: false,
    } as any)
    vi.mocked(useCreateGrant).mockReturnValue({ mutate: vi.fn() } as any)
    vi.mocked(useUpdateGrant).mockReturnValue({ mutate: updateGrantMutate } as any)
    vi.mocked(useDeleteGrant).mockReturnValue({ mutate: vi.fn() } as any)

    renderComponent()

    const hideButton = screen.getByTitle("Hide grant")
    fireEvent.click(hideButton)

    await waitFor(() => {
      expect(updateGrantMutate).toHaveBeenCalledWith(
        {
          name: "visible-grant",
          hidden: true,
        },
        expect.any(Object)
      )
    })
  })

  it("calls updateGrant with hidden=false when showing a hidden grant", async () => {
    updateGrantMutate = vi.fn((_params, callbacks) => {
      callbacks?.onSuccess?.()
    })

    vi.mocked(useGrants).mockReturnValue({
      data: mockGrants,
      isLoading: false,
    } as any)
    vi.mocked(useCreateGrant).mockReturnValue({ mutate: vi.fn() } as any)
    vi.mocked(useUpdateGrant).mockReturnValue({ mutate: updateGrantMutate } as any)
    vi.mocked(useDeleteGrant).mockReturnValue({ mutate: vi.fn() } as any)

    renderComponent()

    const showButton = screen.getByTitle("Show grant")
    fireEvent.click(showButton)

    await waitFor(() => {
      expect(updateGrantMutate).toHaveBeenCalledWith(
        {
          name: "hidden-grant",
          hidden: false,
        },
        expect.any(Object)
      )
    })
  })

  it("disables toggle button while updating", async () => {
    let resolveUpdate: any
    const updatePromise = new Promise((resolve) => {
      resolveUpdate = resolve
    })

    updateGrantMutate = vi.fn((_params, callbacks) => {
      updatePromise.then(() => callbacks?.onSuccess?.())
    })

    vi.mocked(useGrants).mockReturnValue({
      data: mockGrants,
      isLoading: false,
    } as any)
    vi.mocked(useCreateGrant).mockReturnValue({ mutate: vi.fn() } as any)
    vi.mocked(useUpdateGrant).mockReturnValue({ mutate: updateGrantMutate } as any)
    vi.mocked(useDeleteGrant).mockReturnValue({ mutate: vi.fn() } as any)

    renderComponent()

    const hideButton = screen.getByTitle("Hide grant")
    fireEvent.click(hideButton)

    // Button should be disabled while updating
    await waitFor(() => {
      expect(hideButton).toBeDisabled()
    })

    // Resolve the update
    resolveUpdate()

    // Wait for button to be enabled again
    await waitFor(() => {
      expect(hideButton).not.toBeDisabled()
    })
  })

  it("shows loading indicator while toggling", async () => {
    let resolveUpdate: any
    const updatePromise = new Promise((resolve) => {
      resolveUpdate = resolve
    })

    updateGrantMutate = vi.fn((_params, callbacks) => {
      updatePromise.then(() => callbacks?.onSuccess?.())
    })

    vi.mocked(useGrants).mockReturnValue({
      data: mockGrants,
      isLoading: false,
    } as any)
    vi.mocked(useCreateGrant).mockReturnValue({ mutate: vi.fn() } as any)
    vi.mocked(useUpdateGrant).mockReturnValue({ mutate: updateGrantMutate } as any)
    vi.mocked(useDeleteGrant).mockReturnValue({ mutate: vi.fn() } as any)

    renderComponent()

    const hideButton = screen.getByTitle("Hide grant")
    fireEvent.click(hideButton)

    // Should show "..." while updating
    await waitFor(() => {
      expect(hideButton).toHaveTextContent("...")
    })

    await act(async () => {
      resolveUpdate()
    })
  })

  it("handles toggle error gracefully", async () => {
    const errorMessage = "Network error"
    updateGrantMutate = vi.fn((_params, callbacks) => {
      callbacks?.onError?.(new Error(errorMessage))
    })

    vi.mocked(useGrants).mockReturnValue({
      data: mockGrants,
      isLoading: false,
    } as any)
    vi.mocked(useCreateGrant).mockReturnValue({ mutate: vi.fn() } as any)
    vi.mocked(useUpdateGrant).mockReturnValue({ mutate: updateGrantMutate } as any)
    vi.mocked(useDeleteGrant).mockReturnValue({ mutate: vi.fn() } as any)

    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})

    renderComponent()

    const hideButton = screen.getByTitle("Hide grant")
    fireEvent.click(hideButton)

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(`Failed to toggle visibility: ${errorMessage}`)
    })

    alertSpy.mockRestore()
  })
})

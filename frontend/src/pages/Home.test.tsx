import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { Home } from "./Home"
import { useAuthStore } from "../store/authStore"
import { useGrantsStore } from "../store/grantsStore"
import {
  useGrants,
  useCreateGrant,
  useDeleteGrant,
} from "../hooks/useGrantHooks"
import { useQueryClient } from "@tanstack/react-query"

import { mockAdminUser, EMPTY_PAGINATED_RESPONSE } from "../test/mock-data"
import { mockMutationSuccess, mockMutationLoading } from "../test/test-utils"
// Mock everything the component depends on
vi.mock("../store/authStore")
vi.mock("../store/grantsStore")
vi.mock("../hooks/useGrantHooks")
vi.mock("@tanstack/react-query", async importOriginal => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>()
  return {
    ...actual,
    useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
  }
})

// Mock child components — note mocks in separate file to keep this cleaner
vi.mock("../components/grant/ExpandableGrantItem", async () => {
  const { MockExpandableGrantItem } = await import("./Home.test.mocks")
  return { ExpandableGrantItem: MockExpandableGrantItem }
})
vi.mock("../components/dynamicFields/DynamicFieldModal", async () => {
  const { MockDynamicFieldModal } = await import("./Home.test.mocks")
  return { DynamicFieldModal: MockDynamicFieldModal }
})
vi.mock("../components/dynamicFields/DynamicFieldPreview", async () => {
  const { MockDynamicFieldPreview } = await import("./Home.test.mocks")
  return { DynamicFieldPreview: MockDynamicFieldPreview }
})
vi.mock("../components/dynamicFields/DynamicFieldInput", async () => {
  const { MockDynamicFieldInput } = await import("./Home.test.mocks")
  return { DynamicFieldInput: MockDynamicFieldInput }
})

const mockUseGrants = (overrides: Record<string, unknown> = {}) => {
  vi.mocked(useGrants).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...overrides,
  } as any)
}

// Helper function to fill a create grant form with passed values
function fillGrantForm(name: string, deadline: string, description: string) {
  fireEvent.change(
    document.querySelector<HTMLInputElement>('input[name="name"]')!,
    { target: { value: name } },
  )
  fireEvent.change(
    document.querySelector<HTMLInputElement>('input[name="deadline"]')!,
    { target: { value: deadline } },
  )
  fireEvent.change(
    document.querySelector<HTMLTextAreaElement>(
      'textarea[name="description"]',
    )!,
    { target: { value: description } },
  )
}

// Helper function to actaully submit the form
function submitGrantForm() {
  fireEvent.click(screen.getByRole("button", { name: /Create Grant/i }))
}

// Mock implementations for the creation of grant item
// to simulate different states
function mockCreateMutate(mutate?: ReturnType<typeof vi.fn>) {
  const mockFunction = mutate ?? vi.fn()
  vi.mocked(useCreateGrant).mockReturnValue({
    ...mockMutationSuccess(),
    mutate: mockFunction,
  } as any)
  return mockFunction
}

describe("Home Page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: mockAdminUser,
      setUser: vi.fn(),
      clearAuth: vi.fn(),
    } as any)
    vi.mocked(useGrantsStore).mockReturnValue({
      currentPage: 1,
      itemsPerPage: 10,
      setCurrentPage: vi.fn(),
      setItemsPerPage: vi.fn(),
      reset: vi.fn(),
    } as any)
    mockUseGrants()
    vi.mocked(useCreateGrant).mockReturnValue(mockMutationSuccess() as any)
    vi.mocked(useDeleteGrant).mockReturnValue(mockMutationSuccess() as any)
    vi.mocked(useQueryClient).mockReturnValue({
      invalidateQueries: vi.fn(),
      clear: vi.fn(),
      removeQueries: vi.fn(),
    } as any)
  })

  it("should render the Create Grant form", () => {
    render(<Home />)
    // Both the heading and the button say "Create Grant" - assert the heading h2 exists
    expect(screen.getAllByText(/Create Grant/i).length).toBeGreaterThanOrEqual(
      1,
    )
    expect(screen.getByText("Grant Name")).toBeDefined()
  })

  it("should render the List Grants section", () => {
    render(<Home />)
    expect(screen.getByText("List Grants")).toBeDefined()
  })

  it("should show loading state for grants", () => {
    mockUseGrants({ isLoading: true })
    render(<Home />)
    expect(screen.getByText(/Loading grants/i)).toBeDefined()
  })

  it("should show empty state when no grants exist", () => {
    mockUseGrants({ data: EMPTY_PAGINATED_RESPONSE })
    render(<Home />)
    expect(screen.getByText(/no grants/i)).toBeDefined()
  })

  it("should list grants when data is available", () => {
    mockUseGrants({
      data: {
        ...EMPTY_PAGINATED_RESPONSE,
        items: [
          {
            name: "Env Grant",
            description: "Desc",
            deadline: "2026-12-31",
            deadline_passed: false,
            time_remaining: "1 year",
            hidden: false,
          },
        ],
        total_pages: 1,
        total_items: 1,
      },
    })
    render(<Home />)
    expect(screen.getByText("Env Grant")).toBeDefined()
  })

  it("should render Add Field button", () => {
    render(<Home />)
    expect(screen.getByText("+ Add Field")).toBeDefined()
  })

  it("should show create grant button", () => {
    render(<Home />)
    // Use the submit button role specifically
    expect(screen.getByRole("button", { name: /Create Grant/i })).toBeDefined()
  })

  it("should show pending state on create button", () => {
    vi.mocked(useCreateGrant).mockReturnValue(mockMutationLoading() as any)
    render(<Home />)
    expect(screen.getByText(/Creating.../i)).toBeDefined()
  })

  it("createGrant.mutate shoudl be called on form submit for form with valid data", async () => {
    // Call the helper function to mock the mutate function and get access to it in this test
    const mutate = mockCreateMutate()

    // Render the component
    render(<Home />)

    // Use helper function to fill in the grant form
    fillGrantForm("New Grant", "31/12/2026", "A description")

    // Use helper function to submit the form
    submitGrantForm()

    // Validate that the mutate function was called with the expected values
    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        {
          name: "New Grant",
          deadline: "31/12/2026",
          description: "A description",
        },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      )
    })
  })

  it("form should be resetted and queries invalidated on successful creation of grant", async () => {
    // Mock the functions here to be able to both control the implementation
    // and extract the values called for assertions
    const invalidateQueries = vi.fn().mockResolvedValue(undefined)
    const setCurrentPage = vi.fn()
    vi.mocked(useQueryClient).mockReturnValue({ invalidateQueries } as any)
    vi.mocked(useGrantsStore).mockReturnValue({
      currentPage: 1,
      itemsPerPage: 10,
      setCurrentPage,
      setItemsPerPage: vi.fn(),
      reset: vi.fn(),
    } as any)

    // Mock the mutate function to call onSuccess immediately to simulate a successful grant creation
    const mutate = vi.fn((_: unknown, options?: { onSuccess?: () => void }) =>
      options?.onSuccess?.(),
    )

    // Pass the mocked mutate function into the helper function
    mockCreateMutate(mutate)

    // Render the component
    render(<Home />)

    // Use helper function to fill in the grant form with mock data and submit the form
    fillGrantForm("New Grant", "31/12/2026", "Desc")
    submitGrantForm()

    // validate that the invalidateQueries and setCurrentPage functions were called with the expected values on successful creation of a grant
    await waitFor(() => {
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["grants"] })
      expect(setCurrentPage).toHaveBeenCalledWith(1)
    })
  })

  it("if dynamic fields exist, should be included in create request", async () => {
    // Mock the mutate function to control the implementation and extract the values called for assertions
    const mutate = mockCreateMutate()

    // Render the component
    render(<Home />)

    // Open the add field modal and add a field
    fireEvent.click(screen.getByText("+ Add Field"))
    fireEvent.click(screen.getByText("Add Text Field"))

    // Fill in with random value
    fireEvent.change(screen.getByTestId("dynamic-input-0"), {
      target: { value: "field value" },
    })

    // Now fill in the rest of the grant form and submit the form
    fillGrantForm("Grant With Fields", "31/12/2026", "Desc")
    submitGrantForm()

    // Validate that the mutate function was called with a request body that includes the dynamic field values
    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          custom_fields: expect.stringContaining('"Custom Field"'),
        }),
        expect.any(Object),
      )
    })
  })

  it("should be able to open and close the dynamic field modal", () => {
    // Render the component
    render(<Home />)

    // Modal should not be visible initially
    expect(screen.queryByTestId("field-modal")).toBeNull()

    // Then click the Add Field button to open the modal and validate that it is visible
    fireEvent.click(screen.getByText("+ Add Field"))
    expect(screen.getByTestId("field-modal")).toBeDefined()

    // Then click the close button in the modal and validate that it is no longer visible
    fireEvent.click(screen.getByText("Close Modal"))
    expect(screen.queryByTestId("field-modal")).toBeNull()
  })

  it("on adding of dynamic field in UI, should be shown to user in preview form", () => {
    // Render the component
    render(<Home />)

    // Click the Add Field button to open the modal, add a field, and validate that it is shown in the preview
    fireEvent.click(screen.getByText("+ Add Field"))
    fireEvent.click(screen.getByText("Add Text Field"))

    expect(screen.getByTestId("dynamic-field-0")).toBeDefined()
    expect(screen.getAllByText("Custom Field").length).toBeGreaterThanOrEqual(1)
  })

  it("if user clicks remove last dynamic field button, should remove it", () => {
    // Render the component
    render(<Home />)

    // First add a dynamic field
    // Validate that it has been added
    fireEvent.click(screen.getByText("+ Add Field"))
    fireEvent.click(screen.getByText("Add Text Field"))
    expect(screen.getByTestId("dynamic-field-0")).toBeDefined()
    expect(screen.getByText("- Remove Last")).toBeDefined()

    // Then click the remove last dynamic field button and validate that the field is removed from the preview
    fireEvent.click(screen.getByText("- Remove Last"))
    expect(screen.queryByTestId("dynamic-field-0")).toBeNull()
  })

  it("Remove Last button should not be shown when no dynamic fields exist", () => {
    // Render the component and validate that the Remove Last button is not shown when no dynamic fields have been added
    render(<Home />)
    expect(screen.queryByText("- Remove Last")).toBeNull()
  })

  it("dynamic field values should be updated on input change", () => {
    // Render the component
    render(<Home />)

    // Open the add field modal, add a field, and validate that the input value can be changed
    fireEvent.click(screen.getByText("+ Add Field"))
    fireEvent.click(screen.getByText("Add Text Field"))

    // Validate that the input value can be changed and that the change is reflected in the input's value property
    const input = screen.getByTestId("dynamic-input-0")
    fireEvent.change(input, { target: { value: "my value" } })

    // Kind of a weak implementation but sufficient for v1
    expect(input).toHaveProperty("value", "my value")
  })

  describe("grant list interactions", () => {
    // Define grants API response for use in tests
    const grantsWithItems = {
      ...EMPTY_PAGINATED_RESPONSE,
      items: [
        {
          name: "Env Grant",
          description: "Desc",
          deadline: "2026-12-31",
          deadline_passed: false,
          time_remaining: "1 year",
          hidden: false,
        },
      ],
      total_pages: 1,
      total_items: 1,
    }

    it("should be able to toggle grant expansion", () => {
      // Mock grants api response
      mockUseGrants({ data: grantsWithItems })

      // Render the component
      render(<Home />)

      // First it is collapsed
      expect(screen.getByTestId("expanded-Env Grant")).toHaveTextContent(
        "collapsed",
      )

      // On toggle, it should be expanded
      fireEvent.click(screen.getByText("Toggle Env Grant"))
      expect(screen.getByTestId("expanded-Env Grant")).toHaveTextContent(
        "expanded",
      )

      // Toggle back again, it should be collapsed
      fireEvent.click(screen.getByText("Toggle Env Grant"))
      expect(screen.getByTestId("expanded-Env Grant")).toHaveTextContent(
        "collapsed",
      )
    })

    it("deleteGrant.mutate should be called when delete function is clicked", () => {
      // Mock mutate function for deleltion of grant
      const mutate = vi.fn()
      vi.mocked(useDeleteGrant).mockReturnValue({
        ...mockMutationSuccess(),
        mutate,
      } as any)

      // Mock grants api response
      mockUseGrants({ data: grantsWithItems })

      // Render the component
      render(<Home />)

      // Click delete button
      fireEvent.click(screen.getByText("Delete Env Grant"))

      // Validate that mutate fucntion called with expected values
      expect(mutate).toHaveBeenCalledWith(
        "Env Grant",
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      )
    })

    it("queries shoud be invalidated on delete success", () => {
      // Mock functions here for control and assertions
      const invalidateQueries = vi.fn().mockResolvedValue(undefined)
      vi.mocked(useQueryClient).mockReturnValue({ invalidateQueries } as any)

      const mutate = vi.fn((_: unknown, options?: { onSuccess?: () => void }) =>
        options?.onSuccess?.(),
      )
      vi.mocked(useDeleteGrant).mockReturnValue({
        ...mockMutationSuccess(),
        mutate,
      } as any)

      // Mock grants api response
      mockUseGrants({ data: grantsWithItems })

      // Render the component
      render(<Home />)

      // Click delete button
      fireEvent.click(screen.getByText("Delete Env Grant"))

      // Validate that invalidateQueries called on successful deletion
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["grants"] })
    })

    it("alert should be shown on edit click", () => {
      // Mock the window.alert method (spy on it)
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})

      // Mock grants api response
      mockUseGrants({ data: grantsWithItems })

      // Render teh compoennt
      render(<Home />)

      // Click the edit button and validate that the alert is shown with the grant name
      fireEvent.click(screen.getByText("Edit Env Grant"))

      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining("Env Grant"),
      )

      // Retore the original alert implementation after the test
      alertSpy.mockRestore()
    })

    it("refetchGrants function should be called when refresh button is clicked", () => {
      // Mock the refetch function and grants API response
      const refetch = vi.fn()
      mockUseGrants({ data: grantsWithItems, refetch })

      // Render the component
      render(<Home />)

      // Click refresh button
      fireEvent.click(screen.getByText("Refresh"))

      // Validate that refetch button called
      expect(refetch).toHaveBeenCalled()
    })

    it("alert should be shown on delete error", () => {
      // Mock delete grant mutation to simulate an error
      vi.mocked(useDeleteGrant).mockReturnValue({
        ...mockMutationSuccess(),
        isError: true,
        error: new Error("Delete failed"),
      } as any)

      // Mock grants API response
      mockUseGrants({ data: grantsWithItems })

      // Render the component
      render(<Home />)

      // Validate that the delete error alert shown to the user
      expect(screen.getByText(/Delete failed/i)).toBeDefined()
    })

    it("alert should be shown on create error", () => {
      // Mock create grant mutation to simulate an error
      vi.mocked(useCreateGrant).mockReturnValue({
        ...mockMutationSuccess(),
        isError: true,
        error: new Error("Create failed"),
      } as any)

      // Render the component
      render(<Home />)

      // Fill in the form and submit to trigger the create error
      expect(screen.getByText(/Create failed/i)).toBeDefined()
    })
  })
})

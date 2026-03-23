import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, Mock } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { AdminApplicationView } from "./AdminApplicationView"
import {
  useApplication,
  useUpdateApplication,
} from "../hooks/useApplicationHooks"

vi.mock("../hooks/useApplicationHooks")
vi.mock("react-router-dom", async importOriginal => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return {
    ...actual,
    useParams: vi.fn(() => ({ id: "123" })),
    useNavigate: vi.fn(() => vi.fn()),
  }
})

describe("AdminApplicationView", () => {
  const mutateMock = vi.fn() as unknown as Mock<
    ReturnType<typeof useUpdateApplication>["mutate"]
  >

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useApplication).mockReturnValue({
      data: {
        id: 123,
        status: "pending_review",
        applicant: { email: "user@test.com", public_id: "user-123" },
        grant: { name: "Test Grant", description: "Test Grant Desc" },
        submitted_at: "2026-03-16T00:00:00Z",
        submitted_date: "2026-03-16",
        field_values: { field_0: "Value 0" },
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useApplication>)
    vi.mocked(useUpdateApplication).mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as unknown as ReturnType<typeof useUpdateApplication>)
    vi.spyOn(window, "alert").mockImplementation(() => {})
  })

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <AdminApplicationView />
      </MemoryRouter>,
    )

  it("should render application details", () => {
    renderComponent()
    expect(screen.getByText("Application #123")).toBeDefined()
    expect(screen.getByText("user@test.com")).toBeDefined()
    expect(screen.getByText("Test Grant")).toBeDefined()
    expect(screen.getByText("pending review")).toBeDefined()
  })

  it("should show loading state", () => {
    vi.mocked(useApplication).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useApplication>)
    renderComponent()
    expect(screen.getByText("Loading...")).toBeDefined()
  })

  it.each([
    { label: "Approve", status: "approved" },
    { label: "Deny", status: "denied" },
  ])("should handle $label button click", ({ label, status }) => {
    renderComponent()
    fireEvent.click(screen.getByText(label))

    expect(mutateMock).toHaveBeenCalledWith(
      { applicationId: "123", status },
      expect.any(Object),
    )
  })

  it("should show error alert when update fails", () => {
    mutateMock.mockImplementation((_data, options) => {
      options?.onError?.(
        new Error("Update failed"),
        _data,
        undefined,
        undefined as any,
      )
    })

    renderComponent()
    fireEvent.click(screen.getByText("Approve"))

    expect(window.alert).toHaveBeenCalledWith(
      "Failed to approve application: Update failed",
    )
  })
})

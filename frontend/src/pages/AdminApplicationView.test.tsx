import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, Mock } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { AdminApplicationView } from "./AdminApplicationView"
import { useApplication, useUpdateApplication } from "../hooks/useApplicationHooks"

vi.mock("../hooks/useApplicationHooks")
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return {
    ...actual,
    useParams: vi.fn(() => ({ id: "123" })),
    useNavigate: vi.fn(() => vi.fn()),
  }
})

describe("AdminApplicationView", () => {
  const mutateMock = vi.fn() as unknown as Mock<ReturnType<typeof useUpdateApplication>["mutate"]>

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
        field_values: { field_0: "Value 0" }
      },
      isLoading: false,
      isError: false
    } as unknown as ReturnType<typeof useApplication>)
    vi.mocked(useUpdateApplication).mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn()
    } as unknown as ReturnType<typeof useUpdateApplication>)
    vi.spyOn(window, "alert").mockImplementation(() => { })
  })

  it("should render application details", () => {
    render(<MemoryRouter><AdminApplicationView /></MemoryRouter>)
    expect(screen.getByText("Application #123")).toBeDefined()
    expect(screen.getByText("user@test.com")).toBeDefined()
    expect(screen.getByText("Test Grant")).toBeDefined()
    expect(screen.getByText("pending review")).toBeDefined()
  })

  it("should show loading state", () => {
    vi.mocked(useApplication).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false
    } as unknown as ReturnType<typeof useApplication>)
    render(<MemoryRouter><AdminApplicationView /></MemoryRouter>)
    expect(screen.getByText("Loading...")).toBeDefined()
  })

  it("should handle approve button click", () => {
    render(<MemoryRouter><AdminApplicationView /></MemoryRouter>)
    const approveBtn = screen.getByText("Approve")
    fireEvent.click(approveBtn)

    expect(mutateMock).toHaveBeenCalledWith(
      { applicationId: "123", status: "approved" },
      expect.any(Object)
    )
  })

  it("should handle deny button click", () => {
    render(<MemoryRouter><AdminApplicationView /></MemoryRouter>)
    const denyBtn = screen.getByText("Deny")
    fireEvent.click(denyBtn)

    expect(mutateMock).toHaveBeenCalledWith(
      { applicationId: "123", status: "denied" },
      expect.any(Object)
    )
  })

  it("should show error alert when update fails", () => {
    mutateMock.mockImplementation((_data, options) => {
      options?.onError?.(new Error("Update failed"), _data, undefined, undefined as any)
    })

    render(<MemoryRouter><AdminApplicationView /></MemoryRouter>)
    fireEvent.click(screen.getByText("Approve"))

    expect(window.alert).toHaveBeenCalledWith("Failed to approve application: Update failed")
  })
})

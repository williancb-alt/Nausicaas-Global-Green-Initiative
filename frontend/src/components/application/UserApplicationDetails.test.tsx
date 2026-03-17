import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { UserApplicationDetails } from "./UserApplicationDetails"
import type { Application } from "../../types"

// Mock sub-components
vi.mock("./UserApplicationResponses", () => ({
  UserApplicationResponses: () => <div data-testid="app-responses" />,
}))
vi.mock("./SubmissionLockedModal", () => ({
  SubmissionLockedModal: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean
    onClose: () => void
  }) =>
    isOpen ? (
      <div data-testid="locked-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}))

const mockApplication: Application = {
  id: 1,
  status: "approved",
  submitted_date: "2026-03-16",
  grant: {
    name: "Green Energy Grant",
    description: "Save the world with energy.",
  },
  applicant: { email: "user@test.com" } as unknown as Application["applicant"],
  field_values: {
    field_0: "Response 0",
  } as unknown as Application["field_values"],
} as Application

describe("UserApplicationDetails", () => {
  const onBackMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render application details with approved status", () => {
    render(
      <MemoryRouter>
        <UserApplicationDetails
          application={mockApplication}
          onBack={onBackMock}
        />
      </MemoryRouter>,
    )

    expect(
      screen.getAllByText("Green Energy Grant").length,
    ).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Approved").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("2026-03-16").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByTestId("app-responses")).toBeDefined()
  })

  it("should show reviewer feedback if present", () => {
    const appWithFeedback = { ...mockApplication, feedback: "Great job!" }
    render(
      <MemoryRouter>
        <UserApplicationDetails
          application={appWithFeedback}
          onBack={onBackMock}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText("Reviewer Feedback")).toBeDefined()
    expect(screen.getByText("Great job!")).toBeDefined()
  })

  it("should toggle the locked modal", () => {
    render(
      <MemoryRouter>
        <UserApplicationDetails
          application={mockApplication}
          onBack={onBackMock}
        />
      </MemoryRouter>,
    )

    // Modal is open by default
    expect(screen.getByTestId("locked-modal")).toBeDefined()

    // Close modal
    fireEvent.click(screen.getByText("Close Modal"))
    expect(screen.queryByTestId("locked-modal")).toBeNull()

    // Reopen via the strip
    fireEvent.click(screen.getByText("Why?"))
    expect(screen.getByTestId("locked-modal")).toBeDefined()
  })

  it("should call onBack when back button is clicked", () => {
    render(
      <MemoryRouter>
        <UserApplicationDetails
          application={mockApplication}
          onBack={onBackMock}
        />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText("Back to Dashboard"))
    expect(onBackMock).toHaveBeenCalled()
  })

  it("should handle different application statuses", () => {
    const pendingApp = {
      ...mockApplication,
      status: "pending_review",
    } as Application
    render(
      <MemoryRouter>
        <UserApplicationDetails application={pendingApp} onBack={onBackMock} />
      </MemoryRouter>,
    )

    expect(screen.getByText("Pending Review")).toBeDefined()
  })
})

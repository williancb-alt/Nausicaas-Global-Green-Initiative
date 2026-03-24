import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { UserApplicationDetails } from "./UserApplicationDetails"
import { mockApplication } from "../../test/mock-data"

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

const detailedMockApp = {
  ...mockApplication,
  status: "approved" as const,
  submitted_date: "2026-03-16",
  grant: {
    name: "Green Energy Grant",
    description: "Save the world with energy.",
  },
}

describe("UserApplicationDetails", () => {
  const onBackMock = vi.fn()

  const renderDetails = (app = detailedMockApp) =>
    render(
      <MemoryRouter>
        <UserApplicationDetails application={app as any} onBack={onBackMock} />
      </MemoryRouter>,
    )

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render application details with approved status", () => {
    renderDetails()
    expect(
      screen.getAllByText("Green Energy Grant").length,
    ).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Approved").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("2026-03-16").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByTestId("app-responses")).toBeDefined()
  })

  it("should show reviewer feedback if present", () => {
    renderDetails({ ...detailedMockApp, feedback: "Great job!" } as any)
    expect(screen.getByText("Reviewer Feedback")).toBeDefined()
    expect(screen.getByText("Great job!")).toBeDefined()
  })

  it("should toggle the locked modal", () => {
    renderDetails()
    expect(screen.getByTestId("locked-modal")).toBeDefined()
    fireEvent.click(screen.getByText("Close Modal"))
    expect(screen.queryByTestId("locked-modal")).toBeNull()
    fireEvent.click(screen.getByText("Why?"))
    expect(screen.getByTestId("locked-modal")).toBeDefined()
  })

  it("should call onBack when back button is clicked", () => {
    renderDetails()
    fireEvent.click(screen.getByText("Back to Dashboard"))
    expect(onBackMock).toHaveBeenCalled()
  })

  it("should handle different application statuses", () => {
    renderDetails({ ...detailedMockApp, status: "pending_review" } as any)
    expect(screen.getByText("Pending Review")).toBeDefined()
  })
})

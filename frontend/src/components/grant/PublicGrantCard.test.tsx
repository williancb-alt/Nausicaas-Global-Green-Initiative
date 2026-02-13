import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { BrowserRouter } from "react-router-dom"
import { PublicGrantCard } from "./PublicGrantCard"
import type { Grant } from "../../services/api/client"

// Mock the auth store
vi.mock("../../store/authStore", () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
    user: null,
  }),
}))

const mockGrant: Grant = {
  name: "Environmental Research Grant",
  description: "Support for environmental research projects",
  deadline: "2024-12-31",
  deadline_passed: false,
  time_remaining: "30 days",
  hidden: false,
  owner: {
    email: "admin@example.com",
    public_id: "123",
  },
}

describe("PublicGrantCard - Application Status Display", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderComponent = (grant: Grant = mockGrant, applicationStatus?: string) => {
    return render(
      <BrowserRouter>
        <PublicGrantCard grant={grant} applicationStatus={applicationStatus} />
      </BrowserRouter>
    )
  }

  it("displays approved status badge with correct styling", () => {
    renderComponent(mockGrant, "approved")

    const badge = screen.getByText("✓ Approved")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("badge", "bg-success")
  })

  it("displays denied status badge with correct styling", () => {
    renderComponent(mockGrant, "denied")

    const badge = screen.getByText("✗ Denied")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("badge", "bg-danger")
  })

  it("displays in_review status badge with correct styling", () => {
    renderComponent(mockGrant, "in_review")

    const badge = screen.getByText("In Review")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("badge", "bg-info")
  })

  it("displays pending_review status badge with correct styling", () => {
    renderComponent(mockGrant, "pending_review")

    const badge = screen.getByText("Pending Review")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("badge", "bg-warning", "text-dark")
  })

  it("does not display status badge when no application status provided", () => {
    renderComponent(mockGrant)

    expect(screen.queryByText(/Approved/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Denied/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Review/)).not.toBeInTheDocument()
  })

  it("displays approved button state when application is approved", () => {
    renderComponent(mockGrant, "approved")

    const button = screen.getByRole("button", { name: /Application Approved/i })
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
    expect(button).toHaveClass("btn-success")
  })

  it("displays denied button state when application is denied", () => {
    renderComponent(mockGrant, "denied")

    const button = screen.getByRole("button", { name: /Application Denied/i })
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
    expect(button).toHaveClass("btn-danger")
  })

  it("displays submitted button state when application is in_review", () => {
    renderComponent(mockGrant, "in_review")

    const button = screen.getByRole("button", { name: /Application Submitted/i })
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
    expect(button).toHaveClass("btn-secondary")
  })

  it("displays submitted button state when application is pending_review", () => {
    renderComponent(mockGrant, "pending_review")

    const button = screen.getByRole("button", { name: /Application Submitted/i })
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
    expect(button).toHaveClass("btn-secondary")
  })

  it("displays Apply Now button when no application status", () => {
    renderComponent(mockGrant)

    const button = screen.getByRole("button", { name: /Apply Now/i })
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()
    expect(button).toHaveClass("btn-success")
  })

  it("does not display apply button when deadline has passed", () => {
    const passedGrant = { ...mockGrant, deadline_passed: true }
    renderComponent(passedGrant)

    expect(screen.queryByRole("button", { name: /Apply/i })).not.toBeInTheDocument()
  })

  it("shows both status badge and deadline badge together", () => {
    renderComponent(mockGrant, "approved")

    expect(screen.getByText("✓ Approved")).toBeInTheDocument()
    expect(screen.getByText("30 days remaining")).toBeInTheDocument()
  })

  it("renders all application statuses correctly", () => {
    const statuses = [
      { status: "approved", text: "✓ Approved", badgeClass: "bg-success" },
      { status: "denied", text: "✗ Denied", badgeClass: "bg-danger" },
      { status: "in_review", text: "In Review", badgeClass: "bg-info" },
      { status: "pending_review", text: "Pending Review", badgeClass: "bg-warning" },
    ]

    statuses.forEach(({ status, text, badgeClass }) => {
      const { unmount } = renderComponent(mockGrant, status)
      const badge = screen.getByText(text)
      expect(badge).toHaveClass("badge", badgeClass)
      unmount()
    })
  })
})

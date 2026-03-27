import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { GrantHeader } from "./GrantHeader"
import type { Grant } from "../../services/api/client"

// Mock grant definition
const mockGrant: Grant = {
  name: "Green Energy",
  deadline: "2026-12-31",
  deadline_passed: false,
  time_remaining: "1 year",
}

describe("GrantHeader", () => {
  it("grant name and deadline render as expected", () => {
    // Render the component with the mock grant and hasApplied set to false
    render(<GrantHeader grant={mockGrant} hasApplied={false} />)

    // Validate that prop values passed down and rendered as expected
    expect(screen.getByText("Green Energy")).toBeDefined()
    expect(screen.getByText("Deadline: 2026-12-31")).toBeDefined()
  })

  it("Applied badge shown when hasApplied prop is true", () => {
    // Render the component with the mock grant and hasApplied set to true
    render(<GrantHeader grant={mockGrant} hasApplied={true} />)

    // Validate that the "✓ Applied" badge is shown when hasApplied is true
    expect(screen.getByText("✓ Applied")).toBeDefined()
  })

  it("Applied badge hidden when hasApplied prop is false", () => {
    // Render the component with the mock grant and hasApplied set to false
    render(<GrantHeader grant={mockGrant} hasApplied={false} />)

    // Validate that the "✓ Applied" badge is not shown when hasApplied is false
    expect(screen.queryByText("✓ Applied")).toBeNull()
  })

  it("deadline hidden when not provided", () => {
    // Update mock grant to have empty deadline
    const noDeadlineGrant: Grant = {
      ...mockGrant,
      deadline: "",
    }

    // Render the component with the updated mock grant and hasApplied set to false
    render(<GrantHeader grant={noDeadlineGrant} hasApplied={false} />)

    // Validate that the deadline is not shown when the deadline value is empty
    expect(screen.queryByText(/Deadline:/)).toBeNull()
  })
})

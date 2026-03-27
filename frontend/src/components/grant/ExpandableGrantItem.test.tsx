import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { ExpandableGrantItem } from "./ExpandableGrantItem"
import type { Grant } from "../../services/api/client"
import React from "react"

// Mock child components to simplify testing of this component
vi.mock("./GrantHeader", () => ({
  GrantHeader: ({
    grant,
    hasApplied,
  }: {
    grant: Grant
    hasApplied: boolean
  }) => (
    <div data-testid="grant-header">
      {grant.name} {hasApplied ? "(applied)" : ""}
    </div>
  ),
}))

vi.mock("./GrantActions", () => ({
  GrantActions: ({
    isExpanded,
    onEditClick,
    onDeleteClick,
    onEdit,
    onDelete,
    isDeleting,
  }: {
    isExpanded: boolean
    onEditClick: (e: React.MouseEvent) => void
    onDeleteClick: (e: React.MouseEvent) => void
    onEdit?: (() => void) | null
    onDelete?: (() => void) | null
    isDeleting?: boolean
  }) => (
    <div data-testid="grant-actions">
      {isExpanded ? "expanded" : "collapsed"}
      {onEdit && <button onClick={onEditClick}>Edit</button>}
      {onDelete && (
        <button onClick={onDeleteClick} disabled={isDeleting}>
          Delete
        </button>
      )}
    </div>
  ),
}))

vi.mock("./GrantDetails", () => ({
  GrantDetails: ({ grant }: { grant: Grant }) => (
    <div data-testid="grant-details">{grant.description}</div>
  ),
}))

// Define a mock grant object to use in tests
const mockGrant: Grant = {
  name: "Green Energy",
  description: "A green energy grant",
  deadline: "2026-12-31",
  deadline_passed: false,
  time_remaining: "1 year",
}

// Define default props for the component for consistent use across tests
const defaultProps = {
  grant: mockGrant,
  isExpanded: false,
  onToggle: vi.fn(),
}

describe("ExpandableGrantItem", () => {
  it("header and actions rendered as expected", () => {
    // Render the component with default props
    render(<ExpandableGrantItem {...defaultProps} />)

    // Validate that the GrantHeader and GrantActions components are rendered
    // Note that these have been mocked at top of this file to simplify the implementation
    expect(screen.getByTestId("grant-header")).toBeDefined()
    expect(screen.getByTestId("grant-actions")).toBeDefined()
  })

  it("details not shown when collapsed", () => {
    // Render the component with default props (collapsed by default)
    render(<ExpandableGrantItem {...defaultProps} />)

    // Validate that the GrantDetails component is not rendered when collapsed and that the expected text is shown in the GrantActions component
    expect(screen.queryByTestId("grant-details")).toBeNull()
    expect(screen.getByText("collapsed")).toBeDefined()
  })

  it("details shown when expanded", () => {
    // Render the component with isExpanded set to true
    render(<ExpandableGrantItem {...defaultProps} isExpanded={true} />)

    // Validate that the GrantDetails component is rendered when expanded
    // and that the expected text is shown in the GrantActions component
    expect(screen.getByTestId("grant-details")).toBeDefined()
    expect(screen.getByText("A green energy grant")).toBeDefined()
    expect(screen.getByText("expanded")).toBeDefined()
  })

  it("onToggle function called when row is clicked", () => {
    // Mock the onToggle function
    const onToggle = vi.fn()

    // Render the component with the mocked onToggle function
    render(<ExpandableGrantItem {...defaultProps} onToggle={onToggle} />)

    // Click the row and validate that the onToggle function was called
    fireEvent.click(screen.getByRole("button"))
    expect(onToggle).toHaveBeenCalled()
  })

  it("onToggle function called on Enter key click", () => {
    // Mock the onToggle function
    const onToggle = vi.fn()

    // Render the component with the mocked onToggle function
    render(<ExpandableGrantItem {...defaultProps} onToggle={onToggle} />)

    // Press the Enter key while the row is focused and validate that the onToggle function was called
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" })
    expect(onToggle).toHaveBeenCalled()
  })

  it("Expands when isExpanded prop set to true", () => {
    // Render the component with default props (collapsed by default) and validate that it is collapsed
    const { rerender } = render(<ExpandableGrantItem {...defaultProps} />)
    expect(screen.getByRole("button")).toHaveProperty("ariaExpanded", "false")

    // Then rerender the component with isExpanded set to true and validate that it is expanded
    rerender(<ExpandableGrantItem {...defaultProps} isExpanded={true} />)
    expect(screen.getByRole("button")).toHaveProperty("ariaExpanded", "true")
  })

  it("onDelete function called with grant name after confirmation", () => {
    // Mock the onDelete function
    // and the window.confirm method to simulate user confirming the delete action
    const onDelete = vi.fn()
    vi.spyOn(window, "confirm").mockReturnValue(true)

    // Render the component with the mocked onDelete function
    render(<ExpandableGrantItem {...defaultProps} onDelete={onDelete} />)

    // Click the Delete button and validate that the onDelete function was called with the grant name after confirmation
    fireEvent.click(screen.getByText("Delete"))
    expect(onDelete).toHaveBeenCalledWith("Green Energy")

    // Restore the original window.confirm method after the test
    vi.mocked(window.confirm).mockRestore()
  })

  it("onDelete function not called when confirm is cancelled", () => {
    // Mock the onDelete function and the window.confirm method to
    // simulate user cancelling the delete action
    const onDelete = vi.fn()
    vi.spyOn(window, "confirm").mockReturnValue(false)

    // Render the component with the mocked onDelete function
    render(<ExpandableGrantItem {...defaultProps} onDelete={onDelete} />)

    // Click the Delete button and validate that the onDelete function was not called
    // when confirmation is cancelled by the user
    fireEvent.click(screen.getByText("Delete"))
    expect(onDelete).not.toHaveBeenCalled()

    // Restore the original window.confirm method after the test
    vi.mocked(window.confirm).mockRestore()
  })

  it("onEdit function called with expected request", () => {
    // Mock the onEdit function
    const onEdit = vi.fn()

    // Render the component with the mocked onEdit function
    render(<ExpandableGrantItem {...defaultProps} onEdit={onEdit} />)

    // Click the Edit button and validate that the onEdit function was called
    // with expected request object containing grant details
    fireEvent.click(screen.getByText("Edit"))
    expect(onEdit).toHaveBeenCalledWith(mockGrant)
  })

  it("Edit/Delete not rendered when function handlers not provided", () => {
    // Render the component with onEdit and onDelete set to undefined and validate that the Edit and Delete buttons are not rendered
    render(<ExpandableGrantItem {...defaultProps} />)

    // Validate that the Edit and Delete buttons are not rendered when onEdit and onDelete handlers are not provided
    expect(screen.queryByText("Edit")).toBeNull()
    expect(screen.queryByText("Delete")).toBeNull()
  })

  it("hasApplied prop defaults to false", () => {
    // Render the component with default props
    render(<ExpandableGrantItem {...defaultProps} />)

    // Applied status should default to false
    expect(screen.getByTestId("grant-header").textContent).not.toContain(
      "(applied)",
    )
  })
})

import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { GrantActions } from "./GrantActions"

// Default props defined for use across the tests
const defaultProps = {
  isExpanded: false,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  isDeleting: false,
  onEditClick: vi.fn(),
  onDeleteClick: vi.fn(),
}

describe("GrantActions", () => {
  it("Edit and Delete buttons rendered when handlers provided", () => {
    // Render the component with default props which include onEdit and onDelete handlers
    render(<GrantActions {...defaultProps} />)

    // Validate that both Edit and Delete buttons are rendered when handlers are provided
    expect(screen.getByText("Edit")).toBeDefined()
    expect(screen.getByText("Delete")).toBeDefined()
  })

  it("Edit button hdiden when onEdit is undefined", () => {
    // Render the component with onEdit set to undefined and validate
    // that the Edit button is not rendered while Delete button is still rendered
    render(<GrantActions {...defaultProps} onEdit={undefined} />)

    expect(screen.queryByText("Edit")).toBeNull()
    expect(screen.getByText("Delete")).toBeDefined()
  })

  it("Delete button hidden when onDelete is undefined", () => {
    // Render the component with onDelete set to undefined and validate
    // that the Delete button is not rendered while Edit button is still rendered
    render(<GrantActions {...defaultProps} onDelete={undefined} />)

    expect(screen.getByText("Edit")).toBeDefined()
    expect(screen.queryByText("Delete")).toBeNull()
  })

  it("onEditClick function called when Edit button is clicked", () => {
    // Mock the onEditClick function
    const onEditClick = vi.fn()

    // Render the component with the mocked onEditClick function
    render(<GrantActions {...defaultProps} onEditClick={onEditClick} />)

    // Click the Edit button and validate that the onEditClick function was called
    fireEvent.click(screen.getByText("Edit"))
    expect(onEditClick).toHaveBeenCalled()
  })

  it("onDeleteClick function called when Delete button is clicked", () => {
    // Mock the onDeleteClick function
    const onDeleteClick = vi.fn()

    // Render the component with the mocked onDeleteClick function
    render(<GrantActions {...defaultProps} onDeleteClick={onDeleteClick} />)

    // Click the Delete button and validate that the onDeleteClick function was called
    fireEvent.click(screen.getByText("Delete"))
    expect(onDeleteClick).toHaveBeenCalled()
  })

  it("Delete button disabled when isDeleting prop set to true", () => {
    // Render the component with isDeleting set to true
    render(<GrantActions {...defaultProps} isDeleting={true} />)

    // Validate that the Delete button is disabled and that the label "Deleting..." is shown when isDeleting is true
    expect(screen.getByText("...")).toBeDefined()
    expect(screen.getByText("...").closest("button")).toHaveProperty(
      "disabled",
      true,
    )
  })

  it("down arrow shown when collapsed", () => {
    // Render the component with isExpanded set to false (collapsed) and validate that the down arrow is shown
    render(<GrantActions {...defaultProps} isExpanded={false} />)
    expect(screen.getByText("▼")).toBeDefined()
  })

  it("up arrow shown when expanded", () => {
    // Render the component with isExpanded set to true (expanded) and validate that the up arrow is shown
    render(<GrantActions {...defaultProps} isExpanded={true} />)
    expect(screen.getByText("▲")).toBeDefined()
  })
})

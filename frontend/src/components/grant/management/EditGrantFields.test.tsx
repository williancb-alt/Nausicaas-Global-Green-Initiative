import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { EditGrantFields } from "./EditGrantFields"

// Define default props for the component
const defaultProps = {
  editFormData: {
    name: "Test Grant",
    deadline: "12/31/25",
    description: "A test grant description",
  },
  handleEditChange: vi.fn(),
}

describe("EditGrantFields", () => {
  it("All expected fields rendered with labels", () => {
    // Render the component with default props
    render(<EditGrantFields {...defaultProps} />)

    // Validate that all expected form fields and labels are rendered
    expect(screen.getByText("Name")).toBeDefined()
    expect(screen.getByText("Deadline")).toBeDefined()
    expect(screen.getByText("Description")).toBeDefined()
  })

  it("form values displayed as expected", () => {
    // Render the component with default props
    render(<EditGrantFields {...defaultProps} />)

    // Validate that the form fields are populated with the expected values from editFormData
    // defined at the top of this file
    expect(screen.getByDisplayValue("Test Grant")).toBeDefined()
    expect(screen.getByDisplayValue("12/31/25")).toBeDefined()
    expect(screen.getByDisplayValue("A test grant description")).toBeDefined()
  })

  it("name field disabled for existing grants", () => {
    // Render the component with default props
    render(<EditGrantFields {...defaultProps} />)

    // Validate that the name field is disabled and that
    // there is a message indicating that the name cannot be changed for existing grants
    const nameInput = screen.getByDisplayValue("Test Grant")
    expect(nameInput).toHaveProperty("disabled", true)
    expect(screen.getByText("Name cannot be changed")).toBeDefined()
  })

  it("handleEditChange function called when deadline is changed", () => {
    // Mock the handleEditChange function
    const handleEditChange = vi.fn()

    // Render the component with the mocked handleEditChange function
    render(
      <EditGrantFields {...defaultProps} handleEditChange={handleEditChange} />,
    )

    // Change the value of the deadline field and validate that handleEditChange was called
    // with the expected values
    fireEvent.change(screen.getByDisplayValue("12/31/25"), {
      target: { value: "06/15/26" },
    })

    expect(handleEditChange).toHaveBeenCalledWith("deadline", "06/15/26")
  })

  it("handleEditChange function called when description is changed", () => {
    // Mock the handleEditChange function
    const handleEditChange = vi.fn()

    // Render the component with the mocked handleEditChange function
    render(
      <EditGrantFields {...defaultProps} handleEditChange={handleEditChange} />,
    )

    // Change the value of the description field and validate that handleEditChange was called
    fireEvent.change(screen.getByDisplayValue("A test grant description"), {
      target: { value: "Updated description" },
    })

    // Validate that handleEditChange was called with the expected values when the description field is changed
    expect(handleEditChange).toHaveBeenCalledWith(
      "description",
      "Updated description",
    )
  })

  it(" placeholders shown for each field", () => {
    // Render the component with default props
    render(
      <EditGrantFields
        editFormData={{ name: "", deadline: "", description: "" }}
        handleEditChange={vi.fn()}
      />,
    )

    // Validate that the placeholder text for each field is shown as expected when the fields are empty
    expect(screen.getByPlaceholderText("MM/DD/YY")).toBeDefined()
    expect(screen.getByPlaceholderText("Grant description")).toBeDefined()
  })
})

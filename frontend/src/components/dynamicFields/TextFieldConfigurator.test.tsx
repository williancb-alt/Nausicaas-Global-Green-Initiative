import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { TextFieldConfigurator } from "./TextFieldConfigurator"

// Mock functions for onSubmit and onCancel
const defaultProps = {
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
}

describe("TextFieldConfigurator", () => {
  it("renders form with expected fields", () => {
    // Render the component
    render(<TextFieldConfigurator {...defaultProps} />)

    // Validate that everything present as expected
    expect(screen.getByText("Field Label")).toBeDefined()
    expect(screen.getByText("Maximum Character Count")).toBeDefined()
    expect(screen.getByPlaceholderText("e.g., Project Summary")).toBeDefined()
    expect(screen.getByDisplayValue("500")).toBeDefined()
    expect(screen.getByLabelText("Required field")).toBeDefined()
    expect(screen.getByText("Add Field")).toBeDefined()
    expect(screen.getByText("Back")).toBeDefined()
  })

  it("onCancel function called when Back button is clicked", () => {
    // Mock the onCancel function
    const onCancel = vi.fn()

    // Render the component with the mocked onCancel function
    render(<TextFieldConfigurator {...defaultProps} onCancel={onCancel} />)

    // Click the Back button
    fireEvent.click(screen.getByText("Back"))

    // Validate that the onCancel function was called
    expect(onCancel).toHaveBeenCalled()
  })

  it("onSubmit function called with expected values on valid submission", async () => {
    // Mock the onSubmit function
    const onSubmit = vi.fn()

    // Render the component with the mocked onSubmit function
    render(<TextFieldConfigurator {...defaultProps} onSubmit={onSubmit} />)

    // Fill in the form fields with valid values and submit the form
    fireEvent.change(screen.getByPlaceholderText("e.g., Project Summary"), {
      target: { value: "Project Description" },
    })
    fireEvent.click(screen.getByText("Add Field"))

    // Validate that onSubmit was called with the expected values
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        type: "text",
        label: "Project Description",
        maxLength: 500,
        required: false,
      })
    })
  })

  it("Custom values for label, max length, and required fields passed through to function as expected", async () => {
    // Mock the onSubmit function
    const onSubmit = vi.fn()

    // Render the component with the mocked onSubmit function
    render(<TextFieldConfigurator {...defaultProps} onSubmit={onSubmit} />)

    // Update form fields with custom values and submit the form
    fireEvent.change(screen.getByPlaceholderText("e.g., Project Summary"), {
      target: { value: "Notes" },
    })
    fireEvent.change(screen.getByDisplayValue("500"), {
      target: { value: "1000" },
    })
    fireEvent.click(screen.getByLabelText("Required field"))
    fireEvent.click(screen.getByText("Add Field"))

    // Validate that onSubmit was called with the expected values based on the custom inputs
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        type: "text",
        label: "Notes",
        maxLength: 1000,
        required: true,
      })
    })
  })

  it("validation error shown when label is empty", async () => {
    // Mock the onSubmit function
    const onSubmit = vi.fn()

    // Render the component with the mocked onSubmit function
    render(<TextFieldConfigurator {...defaultProps} onSubmit={onSubmit} />)

    // Try to submit the form with an empty label field to trigger validation error
    fireEvent.click(screen.getByText("Add Field"))

    // Validate that the validation error message is shown and that onSubmit was not called
    await waitFor(() => {
      expect(screen.getByText("Label is required")).toBeDefined()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

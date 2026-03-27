import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { FieldTypeSelector } from "./FieldTypeSelector"

// Define default props for the tests
const defaultProps = {
  onSelect: vi.fn(),
  onCancel: vi.fn(),
}

describe("FieldTypeSelector", () => {
  it("all field type options render as expected", () => {
    // Render the component with default props
    render(<FieldTypeSelector {...defaultProps} />)

    // Validate that all field type options are rendered with correct labels
    expect(screen.getByText("Text Input Field")).toBeDefined()
    expect(screen.getByText("Radio Button Field")).toBeDefined()
    expect(screen.getByText("Phone Number Field")).toBeDefined()
    expect(screen.getByText("Email Field")).toBeDefined()
    expect(screen.getByText("Funding Amount Field")).toBeDefined()
  })

  it("descriptions shown for each field type", () => {
    // Render the component with default props
    render(<FieldTypeSelector {...defaultProps} />)

    // Validate that the description text for each field type is shown as expected
    expect(
      screen.getByText(
        "Single or multi-line text with configurable max length",
      ),
    ).toBeDefined()
    expect(
      screen.getByText("Multiple choice with configurable options"),
    ).toBeDefined()
    expect(screen.getByText("Validated phone number input")).toBeDefined()
    expect(screen.getByText("Validated email address input")).toBeDefined()
    expect(screen.getByText("Euro amount with min/max range")).toBeDefined()
  })

  it.each([
    ["Text Input Field", "text"],
    ["Radio Button Field", "radio"],
    ["Phone Number Field", "phone"],
    ["Email Field", "email"],
    ["Funding Amount Field", "currency"],
  ] as const)(
    "calls onSelect function with '%s' when %s is clicked",
    (label, expectedType) => {
      // Mock the onSelect function
      const onSelect = vi.fn()

      // Render the component with the mocked onSelect function
      render(<FieldTypeSelector {...defaultProps} onSelect={onSelect} />)

      // Click the field type option and validate that onSelect was called with the expected type
      fireEvent.click(screen.getByText(label))
      expect(onSelect).toHaveBeenCalledWith(expectedType)
    },
  )

  it("onCancel function called when Cancel button is clicked", () => {
    // Mock the onCancel function
    const onCancel = vi.fn()

    // Render the component with the mocked onCancel function
    render(<FieldTypeSelector {...defaultProps} onCancel={onCancel} />)

    // Click the Cancel button and validate that the onCancel function was called
    fireEvent.click(screen.getByText("Cancel"))
    expect(onCancel).toHaveBeenCalled()
  })

  it("message informing users about field type selection renders", () => {
    // Render the component with default props
    render(<FieldTypeSelector {...defaultProps} />)

    // Validate that the message about selecting field type is shown as expected
    expect(screen.getByText("Select the type of field to add:")).toBeDefined()
  })
})

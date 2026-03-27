import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { CurrencyFieldConfigurator } from "./CurrencyFieldConfigurator"

// Mock functions for onSubmit and onCancel
const defaultProps = {
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
}

describe("CurrencyFieldConfigurator", () => {
  it("renders form fields with expected values", () => {
    // Render the component with default props
    render(<CurrencyFieldConfigurator {...defaultProps} />)

    // Validate that all form fields and labels are rendered with correct default values
    expect(screen.getByText("Field Label")).toBeDefined()
    expect(screen.getByText("Minimum Amount (€)")).toBeDefined()
    expect(screen.getByText("Maximum Amount (€)")).toBeDefined()
    expect(screen.getByLabelText("Required field")).toBeDefined()

    expect(screen.getByDisplayValue("Funding Amount (€)")).toBeDefined()
    expect(screen.getByDisplayValue("0")).toBeDefined()
    expect(screen.getByDisplayValue("100000")).toBeDefined()
  })

  it("renders Add Field and Back buttons", () => {
    // Render the component with default props
    render(<CurrencyFieldConfigurator {...defaultProps} />)

    // Validate that the Add Field and Back buttons are rendered
    expect(screen.getByText("Add Field")).toBeDefined()
    expect(screen.getByText("Back")).toBeDefined()
  })

  it("onCancel function called when Back button is clicked", () => {
    // Mock the onCancel function
    const onCancel = vi.fn()

    // Render the component with the mocked onCancel function
    render(<CurrencyFieldConfigurator {...defaultProps} onCancel={onCancel} />)

    // Click the Back button
    fireEvent.click(screen.getByText("Back"))

    // Validate that the onCancel function was called
    expect(onCancel).toHaveBeenCalled()
  })

  it("onSubmit function called with correct config on valid submission", async () => {
    // Mock the onSubmit function
    const onSubmit = vi.fn()

    // Render the component with the mocked onSubmit function
    render(<CurrencyFieldConfigurator {...defaultProps} onSubmit={onSubmit} />)

    // Fill in the form fields with valid values
    fireEvent.click(screen.getByText("Add Field"))

    // Validate that onSubmit was called with the correct configuration object
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        type: "currency",
        label: "Funding Amount (€)",
        min: 0,
        max: 100000,
        required: false,
      })
    })
  })

  it("Validate that onSubmit is called with correct config when custom values inputted", async () => {
    // Mock the onSubmit function
    const onSubmit = vi.fn()

    // Render the component with the mocked onSubmit function
    render(<CurrencyFieldConfigurator {...defaultProps} onSubmit={onSubmit} />)

    // Fill in the form fields with custom valid values
    fireEvent.change(screen.getByDisplayValue("Funding Amount (€)"), {
      target: { value: "Grant Budget" },
    })
    fireEvent.change(screen.getByDisplayValue("0"), {
      target: { value: "500" },
    })
    fireEvent.change(screen.getByDisplayValue("100000"), {
      target: { value: "50000" },
    })
    fireEvent.click(screen.getByLabelText("Required field"))
    fireEvent.click(screen.getByText("Add Field"))

    // Validate that onSubmit was called with the correct configuration object based on custom input values
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        type: "currency",
        label: "Grant Budget",
        min: 500,
        max: 50000,
        required: true,
      })
    })
  })

  it("validation error shown to users when label is empty", async () => {
    // Mock the onSubmit function
    const onSubmit = vi.fn()

    // Render the component with the mocked onSubmit function
    render(<CurrencyFieldConfigurator {...defaultProps} onSubmit={onSubmit} />)

    // Leave the label field empty and attempt to submit the form
    fireEvent.change(screen.getByDisplayValue("Funding Amount (€)"), {
      target: { value: "" },
    })

    // Tqry to submit the form
    fireEvent.click(screen.getByText("Add Field"))

    // Validate that the appropriate validation error message is displayed
    await waitFor(() => {
      expect(screen.getByText("Label is required")).toBeDefined()
    })

    // Ensure onSubmit was not called due to validation error
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("validation error shown when max value is less than min value", async () => {
    // Mock the onSubmit function
    const onSubmit = vi.fn()

    // Render the component with the mocked onSubmit function
    render(<CurrencyFieldConfigurator {...defaultProps} onSubmit={onSubmit} />)

    // Fill in the form fields with invalid max value less than min value
    const minInput =
      document.querySelector<HTMLInputElement>('input[name="min"]')!
    const maxInput =
      document.querySelector<HTMLInputElement>('input[name="max"]')!

    fireEvent.change(minInput, { target: { value: "500" } })
    fireEvent.change(maxInput, { target: { value: "100" } })
    fireEvent.click(screen.getByText("Add Field"))

    // Validate that the appropriate validation error message is displayed
    await waitFor(() => {
      expect(
        screen.getByText("Maximum must be greater than minimum"),
      ).toBeDefined()
    })

    // Ensure onSubmit was not called due to validation error
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("expected placeholder present on label input", () => {
    // Render the component with default props
    render(<CurrencyFieldConfigurator {...defaultProps} />)

    // Validate that the expected placeholder text is present on the label input field
    expect(
      screen.getByPlaceholderText("e.g., Funding Amount (€)"),
    ).toBeDefined()
  })
})

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { RadioFieldConfigurator } from "./RadioFieldConfigurator"

// Mock functions for onSubmit and onCancel
const defaultProps = {
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
}

// Helper function to render the component and return the onSubmit mock for easier access in tests
// as reused in a number of different tests
function renderWithSubmit() {
  // Mock the onSubmit function
  const onSubmit = vi.fn()

  // Render the component with the mocked onSubmit function
  render(<RadioFieldConfigurator {...defaultProps} onSubmit={onSubmit} />)

  // Return the onSubmit mock so it can be used in the test assertions
  return onSubmit
}

// Helper function to fill in the label and options fields for the radio field configurator form
// Used in a lot of tests so easier to define up here
function fillLabelAndOptions(label: string, options: Record<string, string>) {
  // Fill in the label field and options based on values passed in
  fireEvent.change(screen.getByPlaceholderText("e.g., Project Category"), {
    target: { value: label },
  })

  // Loop through the options passed in and fill in with values passed in
  for (const [placeholder, value] of Object.entries(options)) {
    fireEvent.change(screen.getByPlaceholderText(placeholder), {
      target: { value },
    })
  }
}

// Helper function to click the Add Field button to submit the form, used in multiple tests
function submitForm() {
  fireEvent.click(screen.getByText("Add Field"))
}

describe("RadioFieldConfigurator", () => {
  it("form renderd with expected fields", () => {
    // Render the component with default props
    render(<RadioFieldConfigurator {...defaultProps} />)

    // Validate that all form fields and labels are rendered with expected values
    expect(screen.getByText("Field Label")).toBeDefined()
    expect(screen.getByText("Options")).toBeDefined()
    expect(screen.getByPlaceholderText("Option 1")).toBeDefined()
    expect(screen.getByPlaceholderText("Option 2")).toBeDefined()
    expect(screen.getByLabelText("Required field")).toBeDefined()
    expect(screen.getByText("Add Field")).toBeDefined()
    expect(screen.getByText("Back")).toBeDefined()
  })

  it("onCancel fucntion called when Back button is clicked", () => {
    // Mock the onCancel function
    const onCancel = vi.fn()

    // Render the component with the mocked onCancel function
    render(<RadioFieldConfigurator {...defaultProps} onCancel={onCancel} />)

    // Click the Back button and validate that the onCancel function was called
    fireEvent.click(screen.getByText("Back"))
    expect(onCancel).toHaveBeenCalled()
  })

  it("onSubmit function called with expected values on valid submission", async () => {
    // Render component using helper function that returns mocked
    // onSubmit function for easier access in assertions
    const onSubmit = renderWithSubmit()

    // Use helper function to fill in form fields with random values
    fillLabelAndOptions("Category", { "Option 1": "Alpha", "Option 2": "Beta" })

    // Call helper function to click Add Field button to submit the form
    submitForm()

    // Validate that onSubmit was called with expected configuration
    // The mock alues
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        type: "radio",
        label: "Category",
        options: ["Alpha", "Beta"],
        required: false,
      })
    })
  })

  it("Required field value is passed through successfully", async () => {
    // Render component using helper function that returns mocked
    // onSubmit function for easier access in assertions
    const onSubmit = renderWithSubmit()

    // Use helper function to fill in form fields with random values
    fillLabelAndOptions("Type", { "Option 1": "X", "Option 2": "Y" })

    // Click the required field checkbox to set required to true
    fireEvent.click(screen.getByLabelText("Required field"))

    // Call helper function to click Add Field button to submit the form
    submitForm()

    // Validate that reequire value is set to true after having been clicked
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ required: true }),
      )
    })
  })

  it("validation error shown if user tries to submit when label has not been filled", async () => {
    // Render component using helper function that returns mocked
    // onSubmit function for easier access in assertions
    const onSubmit = renderWithSubmit()

    // Fill in options but leave label empty to trigger validation error
    fireEvent.change(screen.getByPlaceholderText("Option 1"), {
      target: { value: "A" },
    })
    fireEvent.change(screen.getByPlaceholderText("Option 2"), {
      target: { value: "B" },
    })

    // Call helper function to click Add Field button to submit the form
    submitForm()

    // Validate that error message about label being required is shown and onSubmit was not called
    await waitFor(() => {
      expect(screen.getByText("Label is required")).toBeDefined()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("alert message shown to user when fewer than 2 options provided", async () => {
    // Render component using helper function that returns mocked
    // onSubmit function for easier access in assertions
    const onSubmit = renderWithSubmit()

    // Mock window alert functio
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {})

    // Call helper function to fill in label and only 1 option to trigger validation error about needing at least 2 options, then submit the form
    fillLabelAndOptions("Category", { "Option 1": "Only One" })
    submitForm()

    // Validate that alert message about needing at least 2 options is shown and onSubmit was not called
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Please provide at least 2 options")
    })
    expect(onSubmit).not.toHaveBeenCalled()

    // Finalyl restore the mocked alert function
    alertSpy.mockRestore()
  })

  it("empty options removed on submit", async () => {
    // Render component using helper function that returns mocked
    const onSubmit = renderWithSubmit()

    // Call helper function to fill in label and options, including one empty option, then submit the form
    fillLabelAndOptions("Pick", { "Option 1": "Valid", "Option 2": "  " })
    fireEvent.click(screen.getByText("+ Add Option"))
    fireEvent.change(screen.getByPlaceholderText("Option 3"), {
      target: { value: "Also Valid" },
    })

    // Call helper function to click Add Field button to submit the form
    submitForm()

    // Validate that onSubmit was called with expected configuration and that the empty option was removed from the options array
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ options: ["Valid", "Also Valid"] }),
      )
    })
  })

  it("adds option when + Add Option is clicked", () => {
    // Render the component with default props
    render(<RadioFieldConfigurator {...defaultProps} />)

    // Validate that the expected placeholder for the new option input is not present before clicking + Add Option
    expect(screen.queryByPlaceholderText("Option 3")).toBeNull()

    // Click add option button
    fireEvent.click(screen.getByText("+ Add Option"))

    // Validate that the expected placeholder for the new option input is present after clicking + Add Option
    // Note htis is option 3 as two already rendered by default in the tests
    expect(screen.getByPlaceholderText("Option 3")).toBeDefined()
  })

  it("Remove buttons not shown when only 2 options present", () => {
    // Render the component with default props
    render(<RadioFieldConfigurator {...defaultProps} />)

    // Validate that the Remove button is not shown when only 2 options are present
    // Note that there are two options rendered by default in these tests
    expect(screen.queryByText("Remove")).toBeNull()
  })

  it("Remove buttons shown when more than 2 options present", () => {
    // Render the component with default props
    render(<RadioFieldConfigurator {...defaultProps} />)

    // Click add otpion button to add a third
    fireEvent.click(screen.getByText("+ Add Option"))

    // Validate that the Remove button is shown when more than 2 options are present
    expect(screen.getAllByText("Remove")).toHaveLength(3)
  })

  it("Option removed when Remove button is clicked", () => {
    // Render the component with default props
    render(<RadioFieldConfigurator {...defaultProps} />)

    // Click add option button to add a third option
    fireEvent.click(screen.getByText("+ Add Option"))
    expect(screen.getByPlaceholderText("Option 3")).toBeDefined()

    // Click the last Remove button to remove the third option and validate that the option input is removed from the form
    fireEvent.click(screen.getAllByText("Remove")[2])
    expect(screen.queryByPlaceholderText("Option 3")).toBeNull()
  })

  it("Add Option hidden when 10 options exist - limits", () => {
    // Render the component with default props
    render(<RadioFieldConfigurator {...defaultProps} />)

    // 2 already present, add 8 more to reach limit of 10
    for (let i = 0; i < 8; i++) {
      fireEvent.click(screen.getByText("+ Add Option"))
    }

    // Validate that the + Add Option button is hidden when there are already 10 options present
    // and that the placeholder for option 10 is shown
    expect(screen.queryByText("+ Add Option")).toBeNull()
    expect(screen.getByPlaceholderText("Option 10")).toBeDefined()
  })
})

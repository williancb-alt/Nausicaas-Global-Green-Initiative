import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { SimpleFieldConfigurator } from "./SimpleFieldConfigurator"

// Helper function to render component with default props
// Allow overrides to be passed in to test different scenarios
// This is used in multiple tests so easier to define here
function renderComponent(
  fieldType: "phone" | "email",
  overrides: Record<string, unknown> = {},
) {
  // Mock functions for onSubmit and onCancel
  const props = {
    fieldType,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  }

  // Render the component with the props and return the props for use in assertions in the tests
  render(<SimpleFieldConfigurator {...props} />)
  return props
}

describe("SimpleFieldConfigurator", () => {
  it.each([
    {
      fieldType: "phone" as const,
      defaultLabel: "Phone Number",
      placeholder: "e.g., Contact Phone",
    },
    {
      fieldType: "email" as const,
      defaultLabel: "Email Address",
      placeholder: "e.g., Contact Email",
    },
  ])(
    "$fieldType type reners as expected",
    ({ fieldType, defaultLabel, placeholder }) => {
      // Call helper function to render component with specified field type and get the default props for use in assertions
      renderComponent(fieldType)

      // Validate that the form fields and labels are rendered with expected values based on the field type
      expect(screen.getByDisplayValue(defaultLabel)).toBeDefined()
      expect(screen.getByPlaceholderText(placeholder)).toBeDefined()
    },
  )

  it.each([
    {
      fieldType: "phone" as const,
      defaultLabel: "Phone Number",
    },
    {
      fieldType: "email" as const,
      defaultLabel: "Email Address",
    },
  ])(
    "$fieldType type submits with expected values",
    async ({ fieldType, defaultLabel }) => {
      // Call helper function to render component with specified field type and get the default props for use in assertions
      const { onSubmit } = renderComponent(fieldType)

      // Click the Add Field button to submit the form
      fireEvent.click(screen.getByText("Add Field"))

      // Validate that onSubmit was called with the expected request body based on the field type
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          type: fieldType,
          label: defaultLabel,
          required: false,
        })
      })
    },
  )

  it("Updates to label and required fieds passed through to request", async () => {
    // Call helper function to render component with phone field type and get the default props for use in assertions
    const { onSubmit } = renderComponent("phone")

    // Update the label and required fields with random values
    fireEvent.change(screen.getByDisplayValue("Phone Number"), {
      target: { value: "Emergency Contact" },
    })
    fireEvent.click(screen.getByLabelText("Required field"))
    fireEvent.click(screen.getByText("Add Field"))

    // Validate that onSubmit was called with the updated values for label and required fields in the request body
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        type: "phone",
        label: "Emergency Contact",
        required: true,
      })
    })
  })

  it("Validation error shown when label is empty", async () => {
    // Call helper function to render component with email field type and get the default props for use in assertions
    const { onSubmit } = renderComponent("email")

    // Clear the label field to trigger validation error and attempt to submit the form
    fireEvent.change(screen.getByDisplayValue("Email Address"), {
      target: { value: "" },
    })
    fireEvent.click(screen.getByText("Add Field"))

    // Validate that the validation error message is shown and that onSubmit was not called
    await waitFor(() => {
      expect(screen.getByText("Label is required")).toBeDefined()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("onCancel function called when Back button is clicked", () => {
    // Call helper function to render component with phone field type and get the default props for use in assertions
    const { onCancel } = renderComponent("phone")

    // Click the Back button and validate that the onCancel function was called
    fireEvent.click(screen.getByText("Back"))
    expect(onCancel).toHaveBeenCalled()
  })
})

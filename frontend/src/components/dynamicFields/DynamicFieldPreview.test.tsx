import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { DynamicFieldPreview } from "./DynamicFieldPreview"
import type { DynamicFieldConfig } from "../../types"

describe("DynamicFieldPreview", () => {
  it("not rendered when fields array is empty", () => {
    // Render the component with an empty fields array
    const { container } = render(<DynamicFieldPreview fields={[]} />)

    // Validate that the component does not render any content when fields array is empty
    expect(container.innerHTML).toBe("")
  })

  it("field count shown in label", () => {
    // Render the component with a fields array containing two field configurations
    const fields: DynamicFieldConfig[] = [
      { type: "text", label: "Name", maxLength: 100, required: true },
      { type: "email", label: "Contact", required: false },
    ]

    // Render the component with the provided fields array
    render(<DynamicFieldPreview fields={fields} />)

    // Validate that the label displays the correct field count
    expect(screen.getByText("Custom Fields (2)")).toBeDefined()
  })

  it.each<{ field: DynamicFieldConfig; badge: string; detail: string }>([
    {
      field: {
        type: "text",
        label: "Project Title",
        maxLength: 200,
        required: true,
      },
      badge: "Text",
      detail: "Max 200 characters",
    },
    {
      field: {
        type: "radio",
        label: "Category",
        options: ["A", "B", "C"],
        required: false,
      },
      badge: "Radio",
      detail: "Options: A, B, C",
    },
    {
      field: { type: "phone", label: "Phone Number", required: true },
      badge: "Phone",
      detail: "Validated phone number",
    },
    {
      field: { type: "email", label: "Work Email", required: false },
      badge: "Email",
      detail: "Validated email address",
    },
    {
      field: {
        type: "currency",
        label: "Budget",
        min: 100,
        max: 50000,
        required: true,
      },
      badge: "Funding Amount",
      detail: "Range: €100 – €50000",
    },
  ])(
    "renders $field.type field with correct badge and detail",
    ({ field, badge, detail }) => {
      // Render the component with a single field configuration
      render(<DynamicFieldPreview fields={[field]} />)

      // Validate that label shown as expected
      expect(screen.getByText(field.label)).toBeDefined()

      // Validate that the correct badge and detail text are displayed based on the field type and configuration
      expect(screen.getByText(badge)).toBeDefined()
      expect(
        screen.getByText(field.required ? "Required" : "Optional"),
      ).toBeDefined()
      expect(screen.getByText(detail)).toBeDefined()
    },
  )

  it("multiple fields of different types rendered as expected", () => {
    // Define a mix of different field types
    const fields: DynamicFieldConfig[] = [
      { type: "text", label: "Name", maxLength: 100, required: true },
      { type: "phone", label: "Contact", required: false },
      { type: "currency", label: "Amount", min: 0, max: 10000, required: true },
    ]

    // Render them
    render(<DynamicFieldPreview fields={fields} />)

    // Validate that all are rendered and no errors
    expect(screen.getByText("Custom Fields (3)")).toBeDefined()
    expect(screen.getByText("Name")).toBeDefined()
    expect(screen.getByText("Contact")).toBeDefined()
    expect(screen.getByText("Amount")).toBeDefined()
  })
})

import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { UserApplicationResponses } from "./UserApplicationResponses"

// Mock DynamicFieldInput
vi.mock("../dynamicFields/DynamicFieldInput", () => ({
    DynamicFieldInput: ({ value, field }: any) => (
        <div data-testid="field-input">
            <span data-testid="field-label">{field.label}</span>
            <span data-testid="field-value">{value}</span>
        </div>
    )
}))

describe("UserApplicationResponses", () => {
    it("should show empty state when no field values", () => {
        render(<UserApplicationResponses fieldValues={null} />)
        expect(screen.getByText(/No custom field responses were submitted/)).toBeDefined()
    })

    it("should render fields using config if provided", () => {
        const fieldValues = { field_0: "Response 0", field_1: "Response 1" }
        const configs = [
            { label: "Label 0", type: "text" },
            { label: "Label 1", type: "text" }
        ]

        render(<UserApplicationResponses fieldValues={fieldValues} customFieldConfigs={configs as any} />)

        expect(screen.getAllByTestId("field-input")).toHaveLength(2)
        expect(screen.getByText("Label 0")).toBeDefined()
        expect(screen.getByText("Response 0")).toBeDefined()
    })

    it("should render raw fields if config not provided", () => {
        const fieldValues = { custom_key: "Custom Value" }

        render(<UserApplicationResponses fieldValues={fieldValues} />)

        expect(screen.getByText("custom_key")).toBeDefined()
        expect(screen.getByDisplayValue("Custom Value")).toBeDefined()
    })
})

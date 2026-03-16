import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { GrantDetails } from "./GrantDetails"

describe("GrantDetails", () => {
    it("should render error message if no fields exist", () => {
        const mockGrant = { name: "Test Grant" } as any
        render(<GrantDetails grant={mockGrant} />)
        expect(screen.getByText(/No additional field data available/)).toBeDefined()
    })

    it("should render description if it exists", () => {
        const mockGrant = {
            name: "Test Grant",
            description: "Test Description"
        } as any
        render(<GrantDetails grant={mockGrant} />)
        expect(screen.getByText("Test Description")).toBeDefined()
    })

    it("should render custom fields if they exist", () => {
        const mockGrant = {
            name: "Test Grant",
            custom_fields: {
                configs: [{ label: "Field 1" }],
                values: { field_0: "Value 1" }
            }
        } as any
        render(<GrantDetails grant={mockGrant} />)
        expect(screen.getByText("Custom Fields")).toBeDefined()
        expect(screen.getByText("Field 1:")).toBeDefined()
        expect(screen.getByText("Value 1")).toBeDefined()
    })

    it("should show N/A if field value is missing", () => {
        const mockGrant = {
            name: "Test Grant",
            custom_fields: {
                configs: [{ label: "Field 1" }],
                values: {}
            }
        } as any
        render(<GrantDetails grant={mockGrant} />)
        expect(screen.getByText("N/A")).toBeDefined()
    })
})

import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { GrantDetails } from "./GrantDetails"
import { Grant } from "../../services/api/client"

describe("GrantDetails", () => {
    it("should render error message if no fields exist", () => {
        const mockGrant: Grant = {
            name: "Test Grant",
            deadline: "2026-12-31",
            deadline_passed: false,
            time_remaining: "1 year"
        }
        render(<GrantDetails grant={mockGrant} />)
        expect(screen.getByText(/No additional field data available/)).toBeDefined()
    })

    it("should render description if it exists", () => {
        const mockGrant: Grant = {
            name: "Test Grant",
            description: "Test Description",
            deadline: "2026-12-31",
            deadline_passed: false,
            time_remaining: "1 year"
        }
        render(<GrantDetails grant={mockGrant} />)
        expect(screen.getByText("Test Description")).toBeDefined()
    })

    it("should render custom fields if they exist", () => {
        const mockGrant: Grant = {
            name: "Test Grant",
            deadline: "2026-12-31",
            deadline_passed: false,
            time_remaining: "1 year",
            custom_fields: {
                configs: [{ label: "Field 1", type: "text", maxLength: 100, required: true }],
                values: { field_0: "Value 1" }
            }
        }
        render(<GrantDetails grant={mockGrant} />)
        expect(screen.getByText("Custom Fields")).toBeDefined()
        expect(screen.getByText("Field 1:")).toBeDefined()
        expect(screen.getByText("Value 1")).toBeDefined()
    })

    it("should show N/A if field value is missing", () => {
        const mockGrant: Grant = {
            name: "Test Grant",
            deadline: "2026-12-31",
            deadline_passed: false,
            time_remaining: "1 year",
            custom_fields: {
                configs: [{ label: "Field 1", type: "text", maxLength: 100, required: true }],
                values: {}
            }
        }
        render(<GrantDetails grant={mockGrant} />)
        expect(screen.getByText("N/A")).toBeDefined()
    })
})

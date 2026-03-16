import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { PasswordRequirements } from "./PasswordRequirements"

describe("PasswordRequirements", () => {
    it("should show requirements as unmet for empty password", () => {
        render(<PasswordRequirements password="" />)
        expect(screen.getByText(/At least 8 characters/)).toBeDefined()
        // Should show bullet points, not checkmarks
        expect(screen.queryByText(/✓/)).toBeNull()
    })

    it("should show requirements as met when conditions pass", () => {
        render(<PasswordRequirements password="Password123" />)
        // Should show 3 checkmarks
        const checks = screen.getAllByText((content) => content.includes("\u2713"))
        expect(checks).toHaveLength(3)
    })

    it("should show some met and some unmet", () => {
        render(<PasswordRequirements password="abc" />)
        expect(screen.queryByText((content) => content.includes("\u2713"))).toBeNull()

        render(<PasswordRequirements password="Password" />)
        // 8 chars (met), uppercase (met), no number (unmet)
        const checks = screen.getAllByText((content) => content.includes("\u2713"))
        expect(checks).toHaveLength(2)
    })
})

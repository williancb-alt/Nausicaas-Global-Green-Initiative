import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { AuditStats } from "./AuditStats"
import type { AuditLog } from "../../services/api/audit"

const mockLogs: AuditLog[] = [
    { action: "login_failed", success: false, entity_type: "user", is_admin: false, timestamp: "", details: {} },
    { action: "grant_created", success: true, entity_type: "grant", is_admin: true, timestamp: "", details: {} },
    { action: "application_submitted", success: true, entity_type: "application", is_admin: false, timestamp: "", details: {} }
] as any

describe("AuditStats", () => {
    it("should calculate and render stats", () => {
        render(<AuditStats logs={mockLogs} timeRange="Last 7 Days" />)

        expect(screen.queryAllByText("Last 7 Days")).toHaveLength(4)
        expect(screen.getByText("Security Events")).toBeDefined()

        // Use more flexible matchers for elements with emojis/numbers
        expect(screen.getByText((content) => content.includes("1") && content.includes("⚠️"))).toBeDefined()
        expect(screen.getByText((content) => content.includes("1") && content.includes("📝"))).toBeDefined()
        expect(screen.getByText((content) => content.includes("1") && content.includes("🎯"))).toBeDefined()
        expect(screen.getByText((content) => content.includes("1") && content.includes("📋"))).toBeDefined()
    })

    it("should show success icon if no security events", () => {
        render(<AuditStats logs={[]} timeRange="Today" />)
        expect(screen.getByText((content) => content.includes("0") && content.includes("✅"))).toBeDefined()
    })
})

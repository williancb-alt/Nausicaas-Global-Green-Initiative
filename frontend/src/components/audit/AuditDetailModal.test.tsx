import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { AuditDetailModal } from "./AuditDetailModal"
import type { AuditLog } from "../../services/api/audit"

const mockLog: AuditLog = {
    id: 1,
    action: "grant_edited",
    success: true,
    entity_type: "grant",
    entity_id: 101,
    user_email: "admin@test.com",
    is_admin: true,
    timestamp: "2026-03-01T10:00:00Z",
    ip_address: "127.0.0.1",
    user_agent: "Mozilla",
    failure_reason: null,
    user_id: 1,
    details: JSON.stringify({
        grant_name: "Grant A",
        changes: {
            name: { old: "Grant A Old", new: "Grant A New" }
        }
    })
}

describe("AuditDetailModal", () => {
    const onCloseMock = vi.fn()

    it("should return null if log is null", () => {
        const { container } = render(<AuditDetailModal log={null} onClose={onCloseMock} />)
        expect(container.firstChild).toBeNull()
    })

    it("should render log details", () => {
        render(<AuditDetailModal log={mockLog} onClose={onCloseMock} />)
        expect(screen.getByText(/GRANT EDITED/)).toBeDefined()
        expect(screen.getByText("admin@test.com")).toBeDefined()
        expect(screen.getByText("Grant A")).toBeDefined()
        expect(screen.getByText("Changes Made")).toBeDefined()
        expect(screen.getByText("Grant A Old")).toBeDefined()
        expect(screen.getByText("Grant A New")).toBeDefined()
    })

    it("should call onClose when close button clicked", () => {
        render(<AuditDetailModal log={mockLog} onClose={onCloseMock} />)
        const closeBtn = screen.getByLabelText("Close")
        fireEvent.click(closeBtn)
        expect(onCloseMock).toHaveBeenCalled()
    })

    it("should show failed status", () => {
        const failedLog: AuditLog = {
            ...mockLog,
            success: false,
            failure_reason: "Unknown error",
            action: "login_attempt" // Avoid "FAILED" in header to prevent duplicate "Failed" text
        }
        render(<AuditDetailModal log={failedLog} onClose={onCloseMock} />)
        // Find the specifically "Failed" status badge
        const failedBadges = screen.getAllByText("Failed")
        expect(failedBadges.length).toBeGreaterThan(0)
        expect(screen.getByText("Unknown error")).toBeDefined()
    })
})

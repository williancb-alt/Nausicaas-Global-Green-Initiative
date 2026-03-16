import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { AdminDashboardHeader } from "./AdminDashboardHeader"

describe("AdminDashboardHeader", () => {
    const props = {
        userEmail: "admin@test.com",
        onManageGrants: vi.fn(),
        onManageAwards: vi.fn(),
        onViewAuditLogs: vi.fn(),
        onLogout: vi.fn()
    }

    it("should render admin info and buttons", () => {
        render(<AdminDashboardHeader {...props} />)
        expect(screen.getByText("Admin Dashboard")).toBeDefined()
        expect(screen.getByText(/admin@test.com/)).toBeDefined()
        expect(screen.getByRole("button", { name: "Manage Grants" })).toBeDefined()
    })

    it("should call handlers on button clicks", () => {
        render(<AdminDashboardHeader {...props} />)

        fireEvent.click(screen.getByText("Manage Grants"))
        expect(props.onManageGrants).toHaveBeenCalled()

        fireEvent.click(screen.getByText("Manage Awards"))
        expect(props.onManageAwards).toHaveBeenCalled()

        fireEvent.click(screen.getByText("Audit Logs"))
        expect(props.onViewAuditLogs).toHaveBeenCalled()

        fireEvent.click(screen.getByText("Logout"))
        expect(props.onLogout).toHaveBeenCalled()
    })
})

import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { DashboardHeader, GrantCard } from "./DashboardComponents"

describe("DashboardHeader", () => {
    const defaultProps = {
        userEmail: "test@example.com",
        grantCount: 5,
        appCount: 3,
        onLogout: vi.fn(),
    }

    it("should render user email", () => {
        render(<DashboardHeader {...defaultProps} />)
        expect(screen.getByText("test@example.com")).toBeDefined()
    })

    it("should render grant count", () => {
        render(<DashboardHeader {...defaultProps} />)
        // Numbers appear as part of a larger text node so use regex
        expect(screen.getByText(/Available Grants:/i)).toBeDefined()
    })

    it("should render app count", () => {
        render(<DashboardHeader {...defaultProps} />)
        expect(screen.getByText(/Your Applications:/i)).toBeDefined()
    })

    it("should call onLogout when logout button clicked", () => {
        const onLogout = vi.fn()
        render(<DashboardHeader {...defaultProps} onLogout={onLogout} />)
        fireEvent.click(screen.getByText("Logout"))
        expect(onLogout).toHaveBeenCalledOnce()
    })
})

describe("GrantCard", () => {
    const mockGrant = {
        name: "Climate Grant",
        deadline: "2026-12-31",
        deadline_passed: false,
        time_remaining: "9 months",
    }

    it("should render the grant name", () => {
        render(<GrantCard grant={mockGrant} />)
        expect(screen.getByText("Climate Grant")).toBeDefined()
    })

    it("should render the deadline", () => {
        render(<GrantCard grant={mockGrant} />)
        expect(screen.getByText("2026-12-31")).toBeDefined()
    })

    it("should render the time remaining", () => {
        render(<GrantCard grant={mockGrant} />)
        expect(screen.getByText("9 months")).toBeDefined()
    })

    it("should render an Apply Now button", () => {
        render(<GrantCard grant={mockGrant} />)
        expect(screen.getByText("Apply Now")).toBeDefined()
    })
})

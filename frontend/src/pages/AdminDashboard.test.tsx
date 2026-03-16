import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { AdminDashboard } from "./AdminDashboard"
import type { Application } from "../types"

// Mock all chart + table components to avoid heavy deps
vi.mock("../components/chart/ApplicationStatusChart", () => ({
    ApplicationStatusChart: () => null,
}))
vi.mock("../components/chart/GrantDistributionChart", () => ({
    GrantDistributionChart: () => null,
}))
vi.mock("../components/table/AdminDashboardApplicationsTable", () => ({
    AdminDashboardApplicationsTable: ({ applications }: { applications: Application[] }) => (
        <div data-testid="apps-table">{applications.length} apps</div>
    ),
}))
vi.mock("../components/card/StatsCard", () => ({
    StatCard: ({ label, value }: { label: string; value: number }) => (
        <div data-testid="stat-card">{label}: {value}</div>
    ),
}))
vi.mock("../components/filter/ApplicationStatusFilterBar", () => ({
    ApplicationStatusFilterBar: () => <div data-testid="filter-bar" />,
}))
vi.mock("../components/header/AdminDashboardHeader", () => ({
    AdminDashboardHeader: ({ userEmail }: { userEmail: string }) => (
        <div data-testid="header">Admin: {userEmail}</div>
    ),
}))

const makeApp = (status: string): Application =>
    ({ id: Math.random(), status, applicant: { email: "test@test.com" }, grant: { name: "Test Grant" } }) as unknown as Application

const defaultProps = {
    user: { email: "admin@example.com", password: "" },
    applications: [],
    grants: [],
    onLogout: vi.fn(),
    onViewApplication: vi.fn(),
    onManageGrants: vi.fn(),
    onManageAwards: vi.fn(),
    onViewAuditLogs: vi.fn(),
}

describe("AdminDashboard", () => {
    beforeEach(() => vi.clearAllMocks())

    it("should render the admin header with email", () => {
        render(<AdminDashboard {...defaultProps} />)
        expect(screen.getByText("Admin: admin@example.com")).toBeDefined()
    })

    it("should render the filter bar", () => {
        render(<AdminDashboard {...defaultProps} />)
        expect(screen.getByTestId("filter-bar")).toBeDefined()
    })

    it("should render applications table", () => {
        const apps = [makeApp("approved"), makeApp("denied")]
        render(<AdminDashboard {...defaultProps} applications={apps} />)
        expect(screen.getByText("2 apps")).toBeDefined()
    })

    it("should show correct total count in stat card", () => {
        const apps = [makeApp("approved"), makeApp("pending_review")]
        render(<AdminDashboard {...defaultProps} applications={apps} />)
        // Text may be split across elements - check the total stat card
        const cards = screen.getAllByTestId("stat-card")
        const totalCard = cards.find(c => c.textContent?.includes("Total Applications"))
        expect(totalCard).toBeDefined()
        expect(totalCard?.textContent).toContain("2")
    })
})

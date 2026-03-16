import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { AuditLogs } from "./AuditLogs"
import { useQuery } from "@tanstack/react-query"

// Mock dependencies
vi.mock("@tanstack/react-query", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-query")>()
    return {
        ...actual,
        useQuery: vi.fn(),
    }
})

// Mock child components that might have complex logic/styles
vi.mock("../components/audit/AuditStats", () => ({
    AuditStats: () => <div data-testid="audit-stats" />,
}))
vi.mock("../components/audit/AuditFilters", () => ({
    AuditFilters: () => <div data-testid="audit-filters" />,
}))
vi.mock("../components/audit/AuditTable", () => ({
    AuditTable: ({ logs }: any) => (
        <div data-testid="audit-table">
            {logs.map((log: any, i: number) => (
                <div key={i} data-testid="log-row">{log.action}</div>
            ))}
        </div>
    ),
}))
vi.mock("../components/audit/AuditDetailModal", () => ({
    AuditDetailModal: ({ log }: any) => log ? <div data-testid="detail-modal">{log.action}</div> : null,
}))

const mockLogs = {
    logs: [
        { entity_type: "grant", action: "grant_created", user_email: "admin@test.com", is_admin: true, success: true },
        { entity_type: "application", action: "app_submitted", user_email: "user@test.com", is_admin: false, success: true },
        { entity_type: "security", action: "login_failed", user_email: null, is_admin: false, success: false },
    ]
}

describe("AuditLogs", () => {
    const refetchMock = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useQuery).mockReturnValue({
            data: mockLogs,
            isLoading: false,
            error: null,
            refetch: refetchMock,
        } as any)
    })

    it("should render the audit logs dashboard", () => {
        render(<AuditLogs />)
        expect(screen.getByText("🔒 Audit Log Dashboard")).toBeDefined()
        expect(screen.getByTestId("audit-stats")).toBeDefined()
        expect(screen.getByTestId("audit-table")).toBeDefined()
    })

    it("should show loading state", () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
            refetch: vi.fn(),
        } as any)

        render(<AuditLogs />)
        expect(screen.getAllByText("Loading...").length).toBeGreaterThan(0)
        expect(screen.getByRole("status")).toBeDefined() // Spinner
    })

    it("should show error state", () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error("Fetch failed"),
            refetch: vi.fn(),
        } as any)

        render(<AuditLogs />)
        expect(screen.getByText(/Error loading audit logs/)).toBeDefined()
        expect(screen.getByText("Fetch failed")).toBeDefined()
    })

    it("should filter logs by tab (Grants)", async () => {
        render(<AuditLogs />)

        // Default tab is 'grants'
        const rows = screen.getAllByTestId("log-row")
        expect(rows).toHaveLength(1)
        expect(rows[0].textContent).toBe("grant_created")
    })

    it("should change tab and filter logs (All Activity)", () => {
        render(<AuditLogs />)

        const allTab = screen.getByText("All Activity")
        fireEvent.click(allTab)

        const rows = screen.getAllByTestId("log-row")
        expect(rows).toHaveLength(3)
    })

    it("should show 'Coming Soon' for disabled tabs", () => {
        // Modify mock data to not have applications
        vi.mocked(useQuery).mockReturnValue({
            data: { logs: [mockLogs.logs[0]] },
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        } as any)

        render(<AuditLogs />)

        const appsTab = screen.getByText(/Applications/)
        expect(appsTab.textContent).toContain("Coming Soon")
        expect(appsTab).toBeDisabled()
    })

    it("should call refetch when refresh button is clicked", () => {
        render(<AuditLogs />)

        const refreshBtn = screen.getByText("Refresh")
        fireEvent.click(refreshBtn)

        expect(refetchMock).toHaveBeenCalled()
    })
})

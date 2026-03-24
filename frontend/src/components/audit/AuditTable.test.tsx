import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { AuditTable } from "./AuditTable"
import type { AuditLog } from "../../services/api/audit"

const mockLogs: Partial<AuditLog>[] = [
  {
    id: 1,
    action: "grant_created",
    success: true,
    entity_type: "grant",
    entity_id: 101,
    user_email: "admin@test.com",
    is_admin: true,
    timestamp: "2026-03-01T10:00:00Z",
    details: JSON.stringify({ grant_name: "Grant A" }),
  },
] as Partial<AuditLog>[]

const typedMockLogs = mockLogs as AuditLog[]

describe("AuditTable", () => {
  const onRowClickMock = vi.fn()

  it("should render empty state", () => {
    render(<AuditTable logs={[]} onRowClick={onRowClickMock} />)
    expect(screen.getByText("No Audit Logs Found")).toBeDefined()
  })

  it("should render logs in table", () => {
    render(<AuditTable logs={typedMockLogs} onRowClick={onRowClickMock} />)

    expect(screen.getByText("admin@test.com")).toBeDefined()
    expect(screen.getByText("Created")).toBeDefined()
    expect(screen.getByText("Grant A")).toBeDefined()
    expect(screen.getByText("✅")).toBeDefined()
  })

  it("should call onRowClick when row is clicked", () => {
    render(<AuditTable logs={typedMockLogs} onRowClick={onRowClickMock} />)
    const row = screen.getByText("admin@test.com").closest("tr")!
    fireEvent.click(row)
    expect(onRowClickMock).toHaveBeenCalledWith(typedMockLogs[0])
  })

  it("should show specialized status icons", () => {
    const mixedLogs: AuditLog[] = [
      {
        id: 1,
        action: "grant_deleted",
        success: true,
        timestamp: "2026-01-01",
      },
      { id: 2, action: "grant_edited", success: true, timestamp: "2026-01-01" },
      {
        id: 3,
        action: "login_failed",
        success: false,
        timestamp: "2026-01-01",
      },
    ] as unknown as AuditLog[]

    render(<AuditTable logs={mixedLogs} onRowClick={onRowClickMock} />)
    expect(screen.getByText("🗑️")).toBeDefined()
    expect(screen.getByText("✏️")).toBeDefined()
    expect(screen.getByText("🚨")).toBeDefined()
  })
})

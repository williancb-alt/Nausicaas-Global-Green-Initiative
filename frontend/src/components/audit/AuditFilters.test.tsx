import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { AuditFilters } from "./AuditFilters"

describe("AuditFilters", () => {
  const onFilterChangeMock = vi.fn()
  const adminEmails = ["admin1@test.com", "admin2@test.com"]

  it("should render filter labels and options", () => {
    render(
      <AuditFilters
        onFilterChange={onFilterChangeMock}
        adminEmails={adminEmails}
      />,
    )

    expect(screen.getByLabelText("Action Type")).toBeDefined()
    expect(screen.getByLabelText("Date Range")).toBeDefined()
    expect(screen.getByLabelText("Admin User")).toBeDefined()

    expect(screen.getByText("admin1@test.com")).toBeDefined()
    expect(screen.getByText("admin2@test.com")).toBeDefined()
  })

  it("should call onFilterChange when action is changed", () => {
    render(
      <AuditFilters
        onFilterChange={onFilterChangeMock}
        adminEmails={adminEmails}
      />,
    )

    const actionSelect = screen.getByLabelText("Action Type")
    fireEvent.change(actionSelect, { target: { value: "grant_created" } })

    expect(onFilterChangeMock).toHaveBeenCalledWith({
      action: "grant_created",
      dateRange: "7days",
      userEmail: "all",
    })
  })
})

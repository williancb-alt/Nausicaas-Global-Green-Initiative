import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { AdminDashboardApplicationsTable } from "./AdminDashboardApplicationsTable"
import type { Application } from "../../types"

const mockApps = [
  {
    id: 1,
    applicant: { email: "user1@test.com" },
    grant: { name: "Grant A" },
    status: "approved",
    submitted_date: "2026-01-01",
  },
] as Application[]

describe("AdminDashboardApplicationsTable", () => {
  const onViewMock = vi.fn()

  it("should show empty state", () => {
    render(
      <AdminDashboardApplicationsTable
        applications={[]}
        onViewApplication={onViewMock}
      />,
    )
    expect(screen.getByText("No applications found")).toBeDefined()
  })

  it("should render table with applications", () => {
    render(
      <AdminDashboardApplicationsTable
        applications={mockApps}
        onViewApplication={onViewMock}
      />,
    )
    expect(screen.getByText("user1@test.com")).toBeDefined()
    expect(screen.getByText("Grant A")).toBeDefined()
    expect(screen.getByText("Review")).toBeDefined()
  })

  it("should call onViewApplication on click", () => {
    render(
      <AdminDashboardApplicationsTable
        applications={mockApps}
        onViewApplication={onViewMock}
      />,
    )
    fireEvent.click(screen.getByText("Review"))
    expect(onViewMock).toHaveBeenCalledWith(1)
  })
})

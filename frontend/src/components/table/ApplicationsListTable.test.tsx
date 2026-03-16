import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { ApplicationsListTable } from "./ApplicationsListTable"
import type { Application } from "../../types"

const mockApps = [
    {
        id: 1,
        applicant: { email: "user1@test.com" },
        grant: { name: "Grant A" },
        status: "approved",
        submitted_date: "2026-01-01"
    },
    {
        id: 2,
        applicant: { email: "user2@test.com" },
        grant: { name: "Grant B" },
        status: "pending_review",
        submitted_date: "2026-01-02"
    }
] as Application[]

describe("ApplicationsListTable", () => {
    const onViewMock = vi.fn()

    it("should render table with applications data", () => {
        render(<ApplicationsListTable applications={mockApps} onViewApplication={onViewMock} />)

        expect(screen.getByText("user1@test.com")).toBeDefined()
        expect(screen.getByText("Grant A")).toBeDefined()
        expect(screen.getByText("Approved")).toBeDefined()

        expect(screen.getByText("user2@test.com")).toBeDefined()
        expect(screen.getByText("Grant B")).toBeDefined()
        expect(screen.getByText("Pending Review")).toBeDefined()
    })

    it("should call onViewApplication when review button is clicked", () => {
        render(<ApplicationsListTable applications={mockApps} onViewApplication={onViewMock} />)

        const reviewButtons = screen.getAllByTitle("Review application")
        fireEvent.click(reviewButtons[0])

        expect(onViewMock).toHaveBeenCalledWith(1)
    })

    it("should handle unknown status by falling back to pending_review", () => {
        const appsWithUnknown = [
            {
                id: 3,
                applicant: { email: "user3@test.com" },
                grant: { name: "Grant C" },
                status: "unknown_status",
                submitted_date: "2026-01-03"
            }
        ] as any

        render(<ApplicationsListTable applications={appsWithUnknown} onViewApplication={onViewMock} />)
        expect(screen.getByText("Pending Review")).toBeDefined()
    })
})

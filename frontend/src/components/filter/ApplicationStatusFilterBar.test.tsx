import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { ApplicationStatusFilterBar } from "./ApplicationStatusFilterBar"

describe("ApplicationStatusFilterBar", () => {
    const onStatusFilterChange = vi.fn()
    const onSearchTermChange = vi.fn()

    it("should render filter buttons and search input", () => {
        render(
            <ApplicationStatusFilterBar
                statusFilter="all"
                onStatusFilterChange={onStatusFilterChange}
                searchTerm=""
                onSearchTermChange={onSearchTermChange}
            />
        )

        expect(screen.getByText("All Applications")).toBeDefined()
        expect(screen.getByText("Pending Review")).toBeDefined()
        expect(screen.getByPlaceholderText(/Search by ID/)).toBeDefined()
    })

    it("should call onStatusFilterChange when button clicked", () => {
        render(
            <ApplicationStatusFilterBar
                statusFilter="all"
                onStatusFilterChange={onStatusFilterChange}
                searchTerm=""
                onSearchTermChange={onSearchTermChange}
            />
        )

        fireEvent.click(screen.getByText("Approved"))
        expect(onStatusFilterChange).toHaveBeenCalledWith("approved")
    })

    it("should call onSearchTermChange when typing", () => {
        render(
            <ApplicationStatusFilterBar
                statusFilter="all"
                onStatusFilterChange={onStatusFilterChange}
                searchTerm=""
                onSearchTermChange={onSearchTermChange}
            />
        )

        const input = screen.getByPlaceholderText(/Search by ID/)
        fireEvent.change(input, { target: { value: "test search" } })
        expect(onSearchTermChange).toHaveBeenCalledWith("test search")
    })
})

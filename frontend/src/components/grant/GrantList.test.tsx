import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { GrantsList } from "./GrantList"
import { Grant, GrantPage } from "../../services/api/client"

// Mock PublicGrantCard
vi.mock("./PublicGrantCard", () => ({
    PublicGrantCard: ({ grant }: { grant: Grant }) => <div data-testid="grant-card">{grant.name}</div>
}))

describe("GrantsList", () => {
    const applicationStatusMap = new Map()

    it("should show loading state", () => {
        render(
            <MemoryRouter>
                <GrantsList
                    isLoading={true}
                    isError={false}
                    grants={[]}
                    grantsData={undefined}
                    applicationStatusMap={applicationStatusMap}
                />
            </MemoryRouter>
        )
        expect(screen.getByText("Loading available grants...")).toBeDefined()
    })

    it("should show error state", () => {
        render(
            <MemoryRouter>
                <GrantsList
                    isLoading={false}
                    isError={true}
                    grants={[]}
                    grantsData={undefined}
                    applicationStatusMap={applicationStatusMap}
                />
            </MemoryRouter>
        )
        expect(screen.getByText(/Unable to load grants/)).toBeDefined()
    })

    it("should show empty state", () => {
        render(
            <MemoryRouter>
                <GrantsList
                    isLoading={false}
                    isError={false}
                    grants={[]}
                    grantsData={undefined}
                    applicationStatusMap={applicationStatusMap}
                />
            </MemoryRouter>
        )
        expect(screen.getByText(/No grants are currently available/)).toBeDefined()
    })

    it("should render list of grants", () => {
        const mockGrants: Grant[] = [
            { name: "Grant A", deadline: "2026-12-31", deadline_passed: false, time_remaining: "1 year" },
            { name: "Grant B", deadline: "2026-12-31", deadline_passed: false, time_remaining: "1 year" }
        ]
        render(
            <MemoryRouter>
                <GrantsList
                    isLoading={false}
                    isError={false}
                    grants={mockGrants}
                    grantsData={undefined}
                    applicationStatusMap={applicationStatusMap}
                />
            </MemoryRouter>
        )

        expect(screen.getAllByTestId("grant-card")).toHaveLength(2)
        expect(screen.getByText("Grant A")).toBeDefined()
        expect(screen.getByText("Grant B")).toBeDefined()
    })

    it("should show pagination info if more than one page", () => {
        const mockGrants: Grant[] = [{ name: "Grant A", deadline: "2026-12-31", deadline_passed: false, time_remaining: "1 year" }]
        const mockGrantsData: GrantPage = {
            page: 1,
            total_pages: 5,
            total_items: 25,
            items: mockGrants,
            links: {
                self: "/api/v1/grants?page=1",
                first: "/api/v1/grants?page=1",
                last: "/api/v1/grants?page=5"
            },
            has_next: true,
            has_prev: false,
            items_per_page: 5
        }

        render(
            <MemoryRouter>
                <GrantsList
                    isLoading={false}
                    isError={false}
                    grants={mockGrants}
                    grantsData={mockGrantsData}
                    applicationStatusMap={applicationStatusMap}
                />
            </MemoryRouter>
        )

        expect(screen.getByText(/Showing page 1 of 5/)).toBeDefined()
        expect(screen.getByText(/25 total grants/)).toBeDefined()
    })
})

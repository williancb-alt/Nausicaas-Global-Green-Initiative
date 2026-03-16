import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { GrantsList } from "./GrantList"

// Mock PublicGrantCard
vi.mock("./PublicGrantCard", () => ({
    PublicGrantCard: ({ grant }: any) => <div data-testid="grant-card">{grant.name}</div>
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
        const mockGrants = [{ name: "Grant A" }, { name: "Grant B" }]
        render(
            <MemoryRouter>
                <GrantsList
                    isLoading={false}
                    isError={false}
                    grants={mockGrants as any}
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
        const mockGrants = [{ name: "Grant A" }]
        const mockGrantsData = { page: 1, total_pages: 5, total_items: 25, items: mockGrants }

        render(
            <MemoryRouter>
                <GrantsList
                    isLoading={false}
                    isError={false}
                    grants={mockGrants as any}
                    grantsData={mockGrantsData as any}
                    applicationStatusMap={applicationStatusMap}
                />
            </MemoryRouter>
        )

        expect(screen.getByText(/Showing page 1 of 5/)).toBeDefined()
        expect(screen.getByText(/25 total grants/)).toBeDefined()
    })
})

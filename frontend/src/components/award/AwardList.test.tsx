import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { AwardsList } from "./AwardList"
import { Award } from "../../services/api"

vi.mock("./PublicAwardCard", () => ({
    PublicAwardCard: ({ award }: { award: Award }) => <div data-testid="award-card">{award.name}</div>
}))

const mockAwards: Award[] = [
    { name: "Award 1" },
    { name: "Award 2" }
] as Award[]

const mockAwardsData = {
    page: 1,
    total_pages: 2,
    total_items: 4,
    items: mockAwards
} as any

describe("AwardsList", () => {
    it("should show loading state", () => {
        render(<AwardsList isLoading={true} isError={false} awards={[]} awardsData={undefined} />)
        expect(screen.getByText("Loading available awards...")).toBeDefined()
    })

    it("should show error state", () => {
        render(<AwardsList isLoading={false} isError={true} awards={[]} awardsData={undefined} />)
        expect(screen.getByText(/Unable to load awards/)).toBeDefined()
    })

    it("should show empty state", () => {
        render(<AwardsList isLoading={false} isError={false} awards={[]} awardsData={{ items: [] } as any} />)
        expect(screen.getByText("No awards are currently available. Please check back later.")).toBeDefined()
    })

    it("should render list of awards", () => {
        render(<AwardsList isLoading={false} isError={false} awards={mockAwards} awardsData={mockAwardsData} />)
        expect(screen.getAllByTestId("award-card")).toHaveLength(2)
        expect(screen.getByText("Award 1")).toBeDefined()
        expect(screen.getByText("Award 2")).toBeDefined()
    })

    it("should show pagination info if more than 1 page", () => {
        render(<AwardsList isLoading={false} isError={false} awards={mockAwards} awardsData={mockAwardsData} />)
        expect(screen.getByText(/Showing page 1 of 2/)).toBeDefined()
        expect(screen.getByText(/4 total awards/)).toBeDefined()
    })
})

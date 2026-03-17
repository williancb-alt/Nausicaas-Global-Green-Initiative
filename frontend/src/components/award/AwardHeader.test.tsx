import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { AwardHeader } from "./AwardHeader"
import { Award } from "../../services/api"

const mockAward: Award = {
    name: "Sustainable Future Award",
    deadline: "2024-12-31",
    deadline_passed: false,
    time_remaining: "30 days"
} as Award

describe("AwardHeader", () => {
    it("should render award name and deadline", () => {
        render(<AwardHeader award={mockAward} />)
        expect(screen.getByText("Sustainable Future Award")).toBeDefined()
        expect(screen.getByText("Deadline: 2024-12-31")).toBeDefined()
    })

    it("should not render deadline if not provided", () => {
        const awardNoDeadline: Award = { ...mockAward, deadline: "" } as Award
        render(<AwardHeader award={awardNoDeadline} />)
        expect(screen.queryByText(/Deadline:/)).toBeNull()
    })
})

import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { PublicAwardCard } from "./PublicAwardCard"
import { Award } from "../../services/api"

const mockAward: Award = {
  name: "Sustainable Future",
  deadline: "2024-12-31",
  deadline_passed: false,
  time_remaining: "30 days",
  description: "Protect the earth.",
} as Award

describe("PublicAwardCard", () => {
  it("should render award details", () => {
    render(<PublicAwardCard award={mockAward} />)
    expect(screen.getByText("Sustainable Future")).toBeDefined()
    expect(screen.getByText("Protect the earth.")).toBeDefined()
    expect(screen.getByText("30 days remaining")).toBeDefined()
    expect(screen.getByText("2024-12-31")).toBeDefined()
  })

  it("should show deadline passed badge", () => {
    const passedAward = { ...mockAward, deadline_passed: true } as Award
    render(<PublicAwardCard award={passedAward} />)
    expect(screen.getByText("Deadline Passed")).toBeDefined()
  })
})

import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { SupportStatsCards } from "./SupportStatsCards"

describe("SupportStatsCards", () => {
  it("renders all stat cards with labels", () => {
    // Render the component with example pending and replied counts
    render(<SupportStatsCards pending={3} replied={7} />)

    // Validate that all three stat cards (total, pending, replied) are rendered with the correct labels
    expect(screen.getByText("Total Messages")).toBeDefined()
    expect(screen.getByText("Pending Review")).toBeDefined()
    expect(screen.getByText("Successfully Replied")).toBeDefined()
  })

  it("correct counts displayed", () => {
    // Render the component with specific pending and replied counts
    render(<SupportStatsCards pending={3} replied={7} />)

    // Validate that the total count is the sum of pending and replied,
    // and that the individual counts are displayed correctly
    expect(screen.getByText("10")).toBeDefined()
    expect(screen.getByText("3")).toBeDefined()
    expect(screen.getByText("7")).toBeDefined()
  })
})

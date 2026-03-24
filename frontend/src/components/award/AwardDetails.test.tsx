import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { AwardDetails } from "./AwardDetails"
import { Award } from "../../services/api"

describe("AwardDetails", () => {
  it("should render description if it exists", () => {
    const mockAward = { description: "Protect the oceans." } as Award
    render(<AwardDetails award={mockAward} />)
    expect(screen.getByText("Protect the oceans.")).toBeDefined()
  })

  it("should render message if no description", () => {
    const mockAward = { description: "" } as Award
    render(<AwardDetails award={mockAward} />)
    expect(screen.getByText(/No additional field data available/)).toBeDefined()
  })
})

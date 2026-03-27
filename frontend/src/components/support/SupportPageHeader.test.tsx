import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { SupportPageHeader } from "./SupportPageHeader"

describe("SupportPageHeader", () => {
  it("title and description render", () => {
    // Render the component and validate that the title and description are rendered as expected
    render(<SupportPageHeader />)

    expect(screen.getByText("Support Hub")).toBeDefined()
    expect(
      screen.getByText("Manage and respond to initiative member inquiries"),
    ).toBeDefined()
  })
})

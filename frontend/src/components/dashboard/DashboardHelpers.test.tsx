import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { DashboardLoading, DashboardError } from "./DashboardHelpers"

describe("DashboardLoading", () => {
  it("should render the loading text", () => {
    render(<DashboardLoading />)
    expect(screen.getByText("Loading Dashboard...")).toBeDefined()
  })

  it("should render a spinner element", () => {
    const { container } = render(<DashboardLoading />)
    expect(container.querySelector(".spinner")).toBeDefined()
  })
})

describe("DashboardError", () => {
  it("should render the error message", () => {
    render(<DashboardError error="Something went wrong" />)
    expect(screen.getByText("Something went wrong")).toBeDefined()
  })

  it("should apply error styling", () => {
    const { container } = render(<DashboardError error="Test error" />)
    const errorDiv = container.firstChild as HTMLElement
    expect(errorDiv.style.backgroundColor).toBe("rgb(248, 215, 218)")
  })
})

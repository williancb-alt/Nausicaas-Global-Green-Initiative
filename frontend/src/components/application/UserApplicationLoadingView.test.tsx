import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { UserApplicationLoadingView } from "./UserApplicationLoadingView"

describe("UserApplicationLoadingView", () => {
  it("should render loading state", () => {
    render(<UserApplicationLoadingView />)
    expect(screen.getByRole("status")).toBeDefined()
    expect(screen.getByText("Loading application details...")).toBeDefined()
  })
})

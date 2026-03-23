import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { Header } from "./Header"

vi.mock("../layout/NavBar", () => ({
  default: () => <div data-testid="nav-bar" />,
}))

describe("Header", () => {
  it("should render logo and navbar", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )
    expect(screen.getByAltText("NG")).toBeDefined()
    expect(screen.getByTestId("nav-bar")).toBeDefined()
  })

  it("should have a link to home", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )
    const link = screen.getByLabelText("Go to home page")
    expect(link).toBeDefined()
    expect(link.getAttribute("href")).toBe("/")
  })
})

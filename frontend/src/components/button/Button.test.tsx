import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { Button } from "./Button"

describe("Button", () => {
  it("renders children and applies variant", () => {
    render(<Button variant="success">Click me</Button>)
    const btn = screen.getByRole("button", { name: /click me/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveClass("btn", "btn-success")
  })

  it("calls onClick when clicked", () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Go</Button>)
    fireEvent.click(screen.getByRole("button", { name: /go/i }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("respects disabled", () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    )
    const btn = screen.getByRole("button", { name: /disabled/i })
    expect(btn).toBeDisabled()
    fireEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })
})

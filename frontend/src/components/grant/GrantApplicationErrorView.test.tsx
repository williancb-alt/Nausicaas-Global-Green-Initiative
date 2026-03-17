import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { GrantApplicationErrorView } from "./GrantApplicationErrorView"

vi.mock("../button/Button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode
    onClick: () => void
  }) => <button onClick={onClick}>{children}</button>,
}))

describe("GrantApplicationErrorView", () => {
  it("should render error message and button", () => {
    const onReturnHome = vi.fn()
    render(<GrantApplicationErrorView onReturnHome={onReturnHome} />)
    expect(screen.getByRole("alert")).toBeDefined()
    expect(
      screen.getByText(
        "Unable to load grant details. The grant may not exist.",
      ),
    ).toBeDefined()

    fireEvent.click(screen.getByText("Return to Home"))
    expect(onReturnHome).toHaveBeenCalled()
  })
})

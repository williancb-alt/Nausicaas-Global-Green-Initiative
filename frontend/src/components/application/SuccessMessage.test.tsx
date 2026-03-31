import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { SuccessMessage } from "./SuccessMessage"

describe("SuccessMessage", () => {
  it("Message Sent heading is rendered", () => {
    // Render the component and validate that the "Message Sent" heading is rendered as expected
    render(<SuccessMessage />)
    expect(screen.getByText("Message Sent")).toBeDefined()
  })

  it("renders confirmation message", () => {
    // Render the component and validate the confirmation message is shown
    render(<SuccessMessage />)
    expect(
      screen.getByText(
        /environmental program office has received your message/,
      ),
    ).toBeDefined()
  })
})

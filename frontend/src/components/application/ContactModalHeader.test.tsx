import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { ContactModalHeader } from "./ContactModalHeader"

describe("ContactModalHeader", () => {
  it("Contact Support heading renders as expected", () => {
    // Render the component and validate that the heading text is rendered as expected
    render(<ContactModalHeader onClose={vi.fn()} />)
    expect(screen.getByText("Contact Support")).toBeDefined()
  })

  it("close button renders with aria-label", () => {
    // Render the component and validate that the close button is rendered with the correct aria-label for accessibility
    render(<ContactModalHeader onClose={vi.fn()} />)
    expect(screen.getByLabelText("Close")).toBeDefined()
  })

  it("onClose function called when close button is clicked", () => {
    // Mock the onClose function, render the component with the mocked function, click the close button, and validate that the onClose function was called
    const onClose = vi.fn()
    render(<ContactModalHeader onClose={onClose} />)
    fireEvent.click(screen.getByLabelText("Close"))
    expect(onClose).toHaveBeenCalled()
  })
})

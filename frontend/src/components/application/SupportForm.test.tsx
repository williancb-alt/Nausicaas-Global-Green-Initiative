import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { SupportForm } from "./SupportForm"

describe("SupportForm", () => {
  // Define default props for reuse across tests
  const defaultProps = {
    subject: "Question regarding Application #1",
    setSubject: vi.fn(),
    message: "I need help",
    setMessage: vi.fn(),
    isSubmitting: false,
    error: null as string | null,
    onSubmit: vi.fn(),
    onClose: vi.fn(),
  }

  // Ensure tests have clean mocks before each run
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper function to render the component with default props and any overrides
  function renderForm(propsOverride?: Partial<typeof defaultProps>) {
    return render(<SupportForm {...defaultProps} {...propsOverride} />)
  }

  it("subject and message fields render with provided values", () => {
    // Call helper function to render the component with default props
    renderForm()

    // Check that content renders as expected
    expect(screen.getByLabelText("Subject")).toHaveProperty(
      "value",
      "Question regarding Application #1",
    )
    expect(screen.getByLabelText("Message")).toHaveProperty(
      "value",
      "I need help",
    )
  })

  it("error alert renders when error prop is set", () => {
    // Call helper function to render the component
    renderForm({ error: "Something went wrong" })

    // Validate that error message is shown
    expect(screen.getByText("Something went wrong")).toBeDefined()
  })

  it("error alert not rendered when error is null", () => {
    // Call helper function to render the component
    renderForm({ error: null })

    // Validate that error message is not shown
    expect(screen.queryByText("Something went wrong")).toBeNull()
  })

  it("submit button is disabled when isSubmitting is true", () => {
    // Render component with prop set to true
    renderForm({ isSubmitting: true })

    // And validate that submit buttion is disabled
    expect(screen.getByText("Sending...")).toHaveProperty("disabled", true)
  })

  it("submit button is disabled when message is empty or whitespace", () => {
    // Render with whitespace message
    renderForm({ message: "   " })

    // Validate that submit button is disabled when message is empty or whitespace
    expect(screen.getByText("Send Message")).toHaveProperty("disabled", true)
  })

  it("submit button is enabled when message has content and not in submitting state", () => {
    // Render with valid message and isSubmitting false
    renderForm({ message: "Help me", isSubmitting: false })

    // Validate that submit button is enabled when message has content
    expect(screen.getByText("Send Message")).toHaveProperty("disabled", false)
  })

  it("onSubmit function called when form is submitted", () => {
    // Call helper function to render the component and submit the form
    renderForm()
    fireEvent.click(screen.getByText("Send Message"))
    expect(defaultProps.onSubmit).toHaveBeenCalled()
  })

  it("onClose function when Cancel is clicked", () => {
    // Call helper function to render the component and click Cancel button
    renderForm()
    fireEvent.click(screen.getByText("Cancel"))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it("cancel button is disabled when isSubmitting is set to true", () => {
    // Call helper function to render the component with isSubmitting set to true
    renderForm({ isSubmitting: true })
    expect(screen.getByText("Cancel")).toHaveProperty("disabled", true)
  })

  it("setSubject called when subject input changes", () => {
    // Call helper function to render the component
    renderForm()
    fireEvent.change(screen.getByLabelText("Subject"), {
      target: { value: "New subject" },
    })
    expect(defaultProps.setSubject).toHaveBeenCalledWith("New subject")
  })

  it("setMessage called when message textarea changes", () => {
    // Call helper function to render the component
    renderForm()

    // Update the field with a custom value
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "New message" },
    })

    // Validate that setMessage function was called with expected value
    expect(defaultProps.setMessage).toHaveBeenCalledWith("New message")
  })
})

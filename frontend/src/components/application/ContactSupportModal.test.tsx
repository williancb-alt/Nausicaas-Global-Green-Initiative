import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { ContactSupportModal } from "./ContactSupportModal"
import { api } from "../../services/api"

// Mock the API service to be able to control the responses
vi.mock("../../services/api", () => ({
  api: {
    support: {
      createMessage: vi.fn(),
    },
  },
}))

describe("ContactSupportModal", () => {
  // Put mock function in place for onClose for verification that it is called
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    applicationId: 42,
  }

  // This ensures each test starts with clean mocks
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // After each test, reset timers and the overflow on the dom
  afterEach(() => {
    vi.useRealTimers()
    document.body.style.overflow = ""
  })

  // Helper function to render the modal with default props and any passed overrides
  function renderModal(propsOverride?: Partial<typeof defaultProps>) {
    return render(<ContactSupportModal {...defaultProps} {...propsOverride} />)
  }

  // Helper function to fill in the message field and submit the form
  function fillAndSubmit(message = "Help") {
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: message },
    })
    fireEvent.click(screen.getByText("Send Message"))
  }

  it("Nothing rendered when isOpen set to false", () => {
    // Call helper function to render the modal with isOpen set to false and validate that nothing is rendered in the DOM
    const { container } = renderModal({ isOpen: false })
    expect(container.innerHTML).toBe("")
  })

  it("renders modal with header and form when isOpen set to true", () => {
    // Call helper function to render the modal with default props and validate that content renders
    renderModal()
    expect(screen.getByText("Contact Support")).toBeDefined()
    expect(screen.getByLabelText("Subject")).toBeDefined()
    expect(screen.getByLabelText("Message")).toBeDefined()
    expect(screen.getByText("Send Message")).toBeDefined()
    expect(screen.getByText("Cancel")).toBeDefined()
  })

  it("subject with application ID filled on render", () => {
    // Call helper function to render the modal
    renderModal()
    expect(screen.getByLabelText("Subject")).toHaveProperty(
      "value",
      "Question regarding Application #42",
    )
  })

  it("submit button is disabled when message value is empty", () => {
    // Call helper function to render the modal
    renderModal()
    expect(screen.getByText("Send Message")).toHaveProperty("disabled", true)
  })

  it("submit button enabled when message has content", () => {
    // Call helper function to render modal and fill in message field with content
    renderModal()
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "I need help" },
    })
    expect(screen.getByText("Send Message")).toHaveProperty("disabled", false)
  })

  it("onClose function called when Cancel is clicked", () => {
    // Call helper function to render modal and click Cancel button
    renderModal()
    fireEvent.click(screen.getByText("Cancel"))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it("onClose function called when header close button is clicked", () => {
    // Call helper function to render modal and click header close button
    renderModal()
    fireEvent.click(screen.getByLabelText("Close"))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it("onClose function called when backdrop is clicked", () => {
    // Call helper function to render modal and click backdrop element
    renderModal()
    fireEvent.click(document.querySelector(".modal-backdrop")!)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it("onClose function called when Escape key is pressed", () => {
    // Call helper function to render modal and simulate Escape key press
    renderModal()
    fireEvent.keyDown(document, { key: "Escape" })
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it("able to submit form successfully and shows expected success state", async () => {
    // Mock the API response for successful message creation
    vi.mocked(api.support.createMessage).mockResolvedValue({ message: "ok" })

    // Call helper function to render modal, fill in message field, and submit form
    renderModal()
    fillAndSubmit("I need help with my application")

    await waitFor(() => {
      expect(screen.getByText("Message Sent")).toBeDefined()
    })
    expect(api.support.createMessage).toHaveBeenCalledWith({
      application_id: 42,
      subject: "Question regarding Application #42",
      message: "I need help with my application",
    })
  })

  it("onClose function called after 3 seconds on successful submission", async () => {
    // Mock the API response for successful message creation and use fake timers to control timing
    vi.useFakeTimers()
    vi.mocked(api.support.createMessage).mockResolvedValue({ message: "ok" })

    // Call helper function to render the component
    renderModal()

    // Use act to ensure all state updates and effects are processed after submitting the form
    await act(async () => {
      fillAndSubmit("Help me")
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByText("Message Sent")).toBeDefined()
    expect(defaultProps.onClose).not.toHaveBeenCalled()

    vi.advanceTimersByTime(3000)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it("sending message shown to users while request in progress", async () => {
    // Mock the API response to be a pending promise that we can resolve later to simulate the in-progress state
    let resolvePromise: (value: { message: string }) => void
    vi.mocked(api.support.createMessage).mockReturnValue(
      new Promise(resolve => {
        resolvePromise = resolve
      }),
    )

    // Call helper function to render the component, fill in message field, and submit form
    renderModal()
    fillAndSubmit()

    await waitFor(() => {
      expect(screen.getByText("Sending...")).toBeDefined()
    })
    expect(screen.getByText("Cancel")).toHaveProperty("disabled", true)

    act(() => resolvePromise!({ message: "ok" }))
  })

  it("if API error occurs, show user error from response", async () => {
    // Mock the API response to reject with an error containing a message
    vi.mocked(api.support.createMessage).mockRejectedValue(
      new Error("Rate limit exceeded"),
    )

    // Call helper function to render the component, fill in message field, and submit form
    renderModal()
    fillAndSubmit()

    await waitFor(() => {
      expect(screen.getByText("Rate limit exceeded")).toBeDefined()
    })
  })

  it.each([
    ["network Error", new Error("Network Error"), "Network Error"],
    ["standard Error", new Error("Something broke"), "Something broke"],
    ["unknown error type", "unknown", "Failed to send message."],
  ])("shows error message from %s", async (_label, rejection, expectedText) => {
    // Mock the API response to to reject with passed error
    vi.mocked(api.support.createMessage).mockRejectedValue(rejection)

    // Call helper function to render the component, fill in message field, and submit form
    renderModal()
    fillAndSubmit()

    await waitFor(() => {
      expect(screen.getByText(expectedText)).toBeDefined()
    })
  })

  it("submit button disabled if message is empty (or whitespace)", () => {
    // Call helper function to render the component
    renderModal()
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "   " },
    })
    expect(screen.getByText("Send Message")).toHaveProperty("disabled", true)
  })

  it("subject field can be updated", () => {
    // Call helper function to render the component
    renderModal()

    // Update the field with a custom value
    fireEvent.change(screen.getByLabelText("Subject"), {
      target: { value: "Custom subject" },
    })
    expect(screen.getByLabelText("Subject")).toHaveProperty(
      "value",
      "Custom subject",
    )
  })
})

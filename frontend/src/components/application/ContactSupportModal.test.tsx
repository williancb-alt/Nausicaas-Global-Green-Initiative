import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { ContactSupportModal } from "./ContactSupportModal"
import { api } from "../../services/api"
import { AxiosError } from "axios"

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

  it("Nothing rendered when isOpen set to false", () => {
    const { container } = render(
      <ContactSupportModal {...defaultProps} isOpen={false} />,
    )

    // Validate that modal content not present in DOM
    expect(container.innerHTML).toBe("")
  })

  it("renders modal with header and form when isOpen set to true", () => {
    render(<ContactSupportModal {...defaultProps} />)

    // Validate that modal content is present in DOM
    expect(screen.getByText("Contact Support")).toBeDefined()
    expect(screen.getByLabelText("Subject")).toBeDefined()
    expect(screen.getByLabelText("Message")).toBeDefined()
    expect(screen.getByText("Send Message")).toBeDefined()
    expect(screen.getByText("Cancel")).toBeDefined()
  })

  it("subject with application ID filled on render", () => {
    render(<ContactSupportModal {...defaultProps} />)

    // Note this #42 is from default prop set at top of file
    expect(screen.getByLabelText("Subject")).toHaveProperty(
      "value",
      "Question regarding Application #42",
    )
  })

  it("submit button is disabled when message value is empty", () => {
    render(<ContactSupportModal {...defaultProps} />)

    // If user has not entered message,
    // button should be disable (to prevent empty submission)
    const submitButton = screen.getByText("Send Message")
    expect(submitButton).toHaveProperty("disabled", true)
  })

  it("submit button enabled when message has content", () => {
    render(<ContactSupportModal {...defaultProps} />)

    // Enter dummy message
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "I need help" },
    })

    // Validate that button is enabled when message field has content
    const submitButton = screen.getByText("Send Message")
    expect(submitButton).toHaveProperty("disabled", false)
  })

  it("onClose function called when Cancel is clicked", () => {
    render(<ContactSupportModal {...defaultProps} />)

    // Click cancel button
    fireEvent.click(screen.getByText("Cancel"))

    // Validate that onClose function (from props) is called
    // Note mocked for this test
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it("onClose function called when header close button is clicked", () => {
    render(<ContactSupportModal {...defaultProps} />)

    // The close button in the form header has aria-label="Close"
    fireEvent.click(screen.getByLabelText("Close"))

    // Validate that onClose function (from props) is called
    // Note mocked for this test
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it("onClose function called when backdrop is clicked", () => {
    render(<ContactSupportModal {...defaultProps} />)

    // The backdrop element has class "modal-backdrop" in Bootstrap modals
    const backdrop = document.querySelector(".modal-backdrop")!

    // Click the backdrop to trigger close
    fireEvent.click(backdrop)

    // Validate that onClose function (from props) is called
    // Note mocked for this test
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it("onClose function called when Escape key is pressed", () => {
    render(<ContactSupportModal {...defaultProps} />)

    // Simulate pressing the Escape key
    fireEvent.keyDown(document, { key: "Escape" })

    // Validate that onClose function (from props) is called
    // Note mocked for this test
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it("able to submit form successfully and shows expected success state", async () => {
    // Mock the API response for successful message creation
    vi.mocked(api.support.createMessage).mockResolvedValue({ message: "ok" })

    // Render the modal with default props
    render(<ContactSupportModal {...defaultProps} />)

    // Fill in the message field
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "I need help with my application" },
    })

    // Click the submit button to send the message
    fireEvent.click(screen.getByText("Send Message"))

    // Validate that the success message is shown after submission
    await waitFor(() => {
      expect(screen.getByText("Message Sent")).toBeDefined()
    })

    // Validate that the API was called with the correct parameters
    expect(api.support.createMessage).toHaveBeenCalledWith({
      application_id: 42,
      subject: "Question regarding Application #42",
      message: "I need help with my application",
    })
  })

  it("onClose function called after 3 seconds on successful submission", async () => {
    // Use fake timers to control the timing of the success message and auto-close behavior
    vi.useFakeTimers()

    // Mock the API response for successful message creation
    vi.mocked(api.support.createMessage).mockResolvedValue({ message: "ok" })

    // Render the modal with default props
    render(<ContactSupportModal {...defaultProps} />)

    // Fill in the message field
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Help me" },
    })

    // Click the submit button to send the message
    await act(async () => {
      fireEvent.click(screen.getByText("Send Message"))
      await vi.advanceTimersByTimeAsync(0)
    })

    // Validate that the success message is shown
    expect(screen.getByText("Message Sent")).toBeDefined()

    // onClose should not have been called immediately after submission
    expect(defaultProps.onClose).not.toHaveBeenCalled()

    // Advance timers by 3 seconds to trigger the auto-close behavior
    vi.advanceTimersByTime(3000)

    // Validate that onClose function is called after 3 seconds
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it("sending message shown to users while request in progress", async () => {
    // Create a promise that can be controlled when it resolves to simulate the API call in progress
    let resolvePromise: (value: { message: string }) => void

    // Use a mock for the API with promise that can be resolved at will in the test
    vi.mocked(api.support.createMessage).mockReturnValue(
      new Promise(resolve => {
        resolvePromise = resolve
      }),
    )

    // Render the modal with default props
    render(<ContactSupportModal {...defaultProps} />)

    // Fill in the message field
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Help" },
    })

    // Click the submit button to send the message
    fireEvent.click(screen.getByText("Send Message"))

    // Validate that the "Sending..." text is shown while the API request is in progress
    await waitFor(() => {
      expect(screen.getByText("Sending...")).toBeDefined()
    })

    // Cancel button should be disabled during submission
    // As request already in progress
    expect(screen.getByText("Cancel")).toHaveProperty("disabled", true)

    // Resolve the API promise to simulate a successful response
    act(() => resolvePromise!({ message: "ok" }))
  })

  it("if API error occurs, show user error from response", async () => {
    // Mock an AxiosError with response data to simulate an API error with a message
    // In this case using a rate limiting 429 error as an example
    const axiosError = new AxiosError("Request failed")
    axiosError.response = {
      data: { message: "Rate limit exceeded" },
      status: 429,
      statusText: "Too Many Requests",
      headers: {},
      config: {} as any,
    }

    // Use the mocked API to reject with the AxiosError when createMessage is called
    vi.mocked(api.support.createMessage).mockRejectedValue(axiosError)

    // Render the modal with default props
    render(<ContactSupportModal {...defaultProps} />)

    // Fill in the message field
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Help" },
    })

    // Click the submit button to send the message
    fireEvent.click(screen.getByText("Send Message"))

    // Validate that the error message from the API response is shown to the user
    await waitFor(() => {
      expect(screen.getByText("Rate limit exceeded")).toBeDefined()
    })
  })

  it.each([
    [
      "AxiosError without response data",
      new AxiosError("Network Error"),
      "Network Error",
    ],
    ["standard Error", new Error("Something broke"), "Something broke"],
    ["unknown error type", "unknown", "Failed to send message."],
  ])("shows error message from %s", async (_label, rejection, expectedText) => {
    // Mock the API to reject with the specified error
    vi.mocked(api.support.createMessage).mockRejectedValue(rejection)

    // Render the modal with default props
    render(<ContactSupportModal {...defaultProps} />)

    // Fill in the message field
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Help" },
    })

    // Click the submit button to send the message
    fireEvent.click(screen.getByText("Send Message"))

    // Validate that the expected error message is shown to the user
    await waitFor(() => {
      expect(screen.getByText(expectedText)).toBeDefined()
    })
  })

  it("submit button disabled if message is empty (or whitespace)", () => {
    // Render the modal with default props
    render(<ContactSupportModal {...defaultProps} />)

    // Enter whitespace message
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "   " },
    })

    // Validate that button is disabled when message field has only whitespace
    const submitButton = screen.getByText("Send Message")
    expect(submitButton).toHaveProperty("disabled", true)
  })

  it("subject field can be updated", () => {
    // Render the modal with default props
    render(<ContactSupportModal {...defaultProps} />)

    // Update the subject field with new value
    fireEvent.change(screen.getByLabelText("Subject"), {
      target: { value: "Custom subject" },
    })

    // Validate that the subject field value is updated
    expect(screen.getByLabelText("Subject")).toHaveProperty(
      "value",
      "Custom subject",
    )
  })
})

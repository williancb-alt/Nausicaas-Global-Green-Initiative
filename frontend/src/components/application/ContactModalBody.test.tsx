import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { ContactModalBody } from "./ContactModalBody"
import { api } from "../../services/api"

// Mock the API module to control the responses
vi.mock("../../services/api", () => ({
  api: {
    support: {
      createMessage: vi.fn(),
    },
  },
}))

describe("ContactModalBody", () => {
  // Define default props for reuse across tests
  const defaultProps = {
    applicationId: 42,
    onClose: vi.fn(),
  }

  // Ensure tests are isolated by clearing mocks before each
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper function to render the component with default props and any overrides
  function renderBody(propsOverride?: Partial<typeof defaultProps>) {
    return render(<ContactModalBody {...defaultProps} {...propsOverride} />)
  }

  // Helper function to fill in the message field and submit the form
  function fillAndSubmit(message = "Help") {
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: message },
    })
    fireEvent.click(screen.getByText("Send Message"))
  }

  it("renders support form by default", () => {
    // Call helper function to render the component
    renderBody()

    // Validate that the form fields and labels are rendered as expected
    expect(screen.getByLabelText("Subject")).toBeDefined()
    expect(screen.getByLabelText("Message")).toBeDefined()
  })

  it("application ID pre-filled in subject field", () => {
    // Call helper function to render the component
    renderBody()

    // Validate that subject field is pre-filled with the expected value based on application ID
    expect(screen.getByLabelText("Subject")).toHaveProperty(
      "value",
      "Question regarding Application #42",
    )
  })

  it("success message shown after successful submission", async () => {
    // Mock API response
    vi.mocked(api.support.createMessage).mockResolvedValue({ message: "ok" })
    // Call helper function to render the component, fill in message field, and submit form
    renderBody()
    fillAndSubmit("I need help")

    // Validate that the success message is shown after the API call resolves
    await waitFor(() => {
      expect(screen.getByText("Message Sent")).toBeDefined()
    })
    expect(api.support.createMessage).toHaveBeenCalledWith({
      application_id: 42,
      subject: "Question regarding Application #42",
      message: "I need help",
    })
  })

  it("error message shown when API call fails", async () => {
    // Mock API response to reject with an error
    vi.mocked(api.support.createMessage).mockRejectedValue(
      new Error("Rate limit exceeded"),
    )

    // Call helper function to render the component, fill in message field, and submit form
    renderBody()
    fillAndSubmit("Help me")

    // Validate that the error message is shown after the API call rejects with the expected error message
    await waitFor(() => {
      expect(screen.getByText("Rate limit exceeded")).toBeDefined()
    })
  })

  it('"Failed to send message." shown for non-Error rejections', async () => {
    // Mock API response to reject with a non-Error value
    vi.mocked(api.support.createMessage).mockRejectedValue("unknown")

    // Call helper function to render the component, fill in message field, and submit form
    renderBody()
    fillAndSubmit("Help me")

    // Validate that the generic error message is shown for non-Error rejections
    await waitFor(() => {
      expect(screen.getByText("Failed to send message.")).toBeDefined()
    })
  })
})

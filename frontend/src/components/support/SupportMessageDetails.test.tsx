import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import {
  MessageMeta,
  MessageContent,
  AdminResponseHistory,
  ReplyForm,
} from "./SupportMessageDetails"
import type { SupportMessage } from "../../services/api/support"

// Define mock support messages to use in tests
const pendingMsg: SupportMessage = {
  id: 1,
  subject: "Help needed",
  message: "I need assistance with my application",
  status: "Pending",
  created_at_str: "Jan 15, 2024",
  user: { email: "user@test.com", public_id: "u1" },
  application_id: 10,
}

const repliedMsg: SupportMessage = {
  ...pendingMsg,
  id: 2,
  status: "Replied",
  admin_response: "We have resolved your issue.",
  answered_at_str: "Jan 16, 2024",
}

const openMsg: SupportMessage = {
  ...pendingMsg,
  id: 3,
  status: "Open",
}

describe("MessageMeta", () => {
  it("status badge, ID, and timestamp rendered for pending message", () => {
    // Render the component with default props and a pending message
    render(<MessageMeta msg={pendingMsg} />)

    // Validate that the status badge, message ID, and created timestamp are rendered as expected for a pending message
    expect(screen.getByText("Pending")).toBeDefined()
    expect(screen.getByText("ID: #1")).toBeDefined()
    expect(screen.getByText("Jan 15, 2024")).toBeDefined()
  })

  it("success badge rendered for replied message", () => {
    // Render the component with default props and a replied message
    render(<MessageMeta msg={repliedMsg} />)

    // Validate that the status badge is "Replied" and has the success styling for a replied message
    const badge = screen.getByText("Replied").closest("span")!
    expect(badge.className).toContain("bg-success")
  })

  it("primary badge rendered for pending message", () => {
    // Render the component with default props and a pending message
    render(<MessageMeta msg={pendingMsg} />)

    // Validate that the status badge is "Pending" and has the primary styling for a pending message
    const badge = screen.getByText("Pending").closest("span")!
    expect(badge.className).toContain("bg-primary")
  })
})

describe("MessageContent", () => {
  it("subject, user email, and message body rendered", () => {
    // Render the component with default props and a pending message
    render(<MessageContent msg={pendingMsg} />)

    // Validate that the message subject, user email, and message body are rendered as expected
    expect(screen.getByText("Help needed")).toBeDefined()
    expect(screen.getByText("user@test.com")).toBeDefined()
    expect(
      screen.getByText("I need assistance with my application"),
    ).toBeDefined()
  })
})

describe("AdminResponseHistory", () => {
  // Define default props for the component for reuse across tests
  const defaultProps = {
    viewingHistory: null,
    setViewingHistory: vi.fn(),
  }

  it("does not render for non-replied messages", () => {
    // Render the component with default props and a pending message
    const { container } = render(
      <AdminResponseHistory {...defaultProps} msg={pendingMsg} />,
    )
    // Validate that not rendered
    expect(container.innerHTML).toBe("")
  })

  it("View Official Response button shown when a reply exists", () => {
    // Render the component with default props and a replied message
    render(<AdminResponseHistory {...defaultProps} msg={repliedMsg} />)

    // Validate that the View Official Response button is shown for a replied message
    expect(screen.getByText("View Official Response")).toBeDefined()
  })

  it("setViewingHistory fuucntion called with message ID on view click", () => {
    // Mock the setViewingHistory function
    const setViewingHistory = vi.fn()

    // Render the component with the mocked setViewingHistory function and a replied message
    render(
      <AdminResponseHistory
        msg={repliedMsg}
        viewingHistory={null}
        setViewingHistory={setViewingHistory}
      />,
    )

    // Click the View Official Response button and validate that setViewingHistory was called with the message ID
    fireEvent.click(screen.getByText("View Official Response"))
    expect(setViewingHistory).toHaveBeenCalledWith(2)
  })

  it("admin response shown when viewing history matches", () => {
    // Render the component with default props, a replied message, and viewingHistory set to the message ID
    render(
      <AdminResponseHistory
        msg={repliedMsg}
        viewingHistory={2}
        setViewingHistory={vi.fn()}
      />,
    )

    // Validate that the admin response content is shown when viewingHistory matches the message ID
    expect(screen.getByText("Official Response")).toBeDefined()
    expect(screen.getByText("We have resolved your issue.")).toBeDefined()
    expect(screen.getByText("Sent at Jan 16, 2024")).toBeDefined()
  })

  it("setViewingHistory function called on close click", () => {
    // Mock the setViewingHistory function
    const setViewingHistory = vi.fn()

    // Render the component with the mocked setViewingHistory function, a replied message, and viewingHistory set to the message ID
    render(
      <AdminResponseHistory
        msg={repliedMsg}
        viewingHistory={2}
        setViewingHistory={setViewingHistory}
      />,
    )

    // Get the close button
    const closeBtn = screen
      .getByText("Official Response")
      .closest(".position-relative")!
      .querySelector("button")!

    // Click the close button and validate that setViewingHistory was called to close it
    fireEvent.click(closeBtn)
    expect(setViewingHistory).toHaveBeenCalledWith(null)
  })

  it("does not render when viewing but no admin_response exists", () => {
    // Extract admin_response from the repliedMsg to create a message without a response,
    // and render the component with viewingHistory set to the message ID
    const { admin_response: _, ...rest } = repliedMsg
    const noResponseMsg: SupportMessage = rest

    // Render the component with default props, a message without an admin response, and viewingHistory set to the message ID
    const { container } = render(
      <AdminResponseHistory
        msg={noResponseMsg}
        viewingHistory={2}
        setViewingHistory={vi.fn()}
      />,
    )

    // Validate that it does not render in this case
    expect(container.innerHTML).toBe("")
  })
})

describe("ReplyForm", () => {
  // Define default props for the component for reuse across tests
  const defaultProps = {
    replyingTo: null,
    setReplyingTo: vi.fn(),
    replyContent: "",
    setReplyContent: vi.fn(),
    onSendReply: vi.fn(),
    isSending: false,
  }

  // Helper to render with the open message and replyingTo matching its ID
  function renderReplyForm(overrides: Record<string, unknown> = {}) {
    const props = {
      ...defaultProps,
      msg: openMsg,
      replyingTo: openMsg.id,
      ...overrides,
    }
    return render(<ReplyForm {...props} />)
  }

  it("does not render for non-Open messages", () => {
    // Render the component with default props and a pending message
    const { container } = render(
      <ReplyForm {...defaultProps} msg={pendingMsg} />,
    )

    // Validate that not rendered
    expect(container.innerHTML).toBe("")
  })

  it("Compose Response button shown when not replying", () => {
    // Render the component with default props, an open message, and replyingTo not matching the message ID
    render(<ReplyForm {...defaultProps} msg={openMsg} />)
    expect(screen.getByText("Compose Response")).toBeDefined()
  })

  it("calls setReplyingTo function with message ID on compose click", () => {
    // Mock the setReplyingTo function
    const setReplyingTo = vi.fn()
    // Render the component with this mock function
    render(
      <ReplyForm
        {...defaultProps}
        msg={openMsg}
        setReplyingTo={setReplyingTo}
      />,
    )

    // Click the Compose Response button and validate that setReplyingTo was called with the message ID
    fireEvent.click(screen.getByText("Compose Response"))
    expect(setReplyingTo).toHaveBeenCalledWith(3)
  })

  it("reply form shown when replyingTo matches", () => {
    // Call helper function to render component
    renderReplyForm()

    // Validate that the form fields and buttons are shown when replyingTo matches the message ID
    expect(screen.getByText("Compose Official Response")).toBeDefined()
    expect(
      screen.getByPlaceholderText("Type your official response here..."),
    ).toBeDefined()
    expect(screen.getByText("Send Reply")).toBeDefined()
  })

  it("setReplyContent function called on textarea change", () => {
    // Mock the setReplyContent function
    const setReplyContent = vi.fn()

    // Call helper function to render component with the mocked setReplyContent function
    renderReplyForm({ setReplyContent })

    // Change the value of the textarea and validate that setReplyContent was called with the expected value
    fireEvent.change(
      screen.getByPlaceholderText("Type your official response here..."),
      { target: { value: "Thank you" } },
    )
    expect(setReplyContent).toHaveBeenCalledWith("Thank you")
  })

  it("setReplyingTo function called on close click", () => {
    // Mock the setReplyingTo function
    const setReplyingTo = vi.fn()

    // Call helper function to render component with the mocked setReplyingTo function
    renderReplyForm({ setReplyingTo })

    // Get the close button and click it, then validate that setReplyingTo was called to close the form
    const closeBtn = screen
      .getByText("Compose Official Response")
      .closest(".d-flex")!
      .querySelector("button")!
    fireEvent.click(closeBtn)
    expect(setReplyingTo).toHaveBeenCalledWith(null)
  })

  it.each([
    {
      scenario: "empty content",
      replyContent: "",
      isSending: false,
      expected: true,
    },
    {
      scenario: "has content",
      replyContent: "Hello",
      isSending: false,
      expected: false,
    },
    {
      scenario: "sending",
      replyContent: "Hello",
      isSending: true,
      expected: true,
    },
  ])(
    "Send Reply button disabled=$expected when $scenario",
    ({ replyContent, isSending, expected }) => {
      // Call helper function to render component with the specified replyContent and isSending values
      renderReplyForm({ replyContent, isSending })

      // Validate that the Send Reply button is disabled or enabled as expected based on the replyContent and isSending values
      expect(screen.getByText("Send Reply").closest("button")).toHaveProperty(
        "disabled",
        expected,
      )
    },
  )

  it("spinner shown when isSending", () => {
    // Helper function to render component with isSending true
    renderReplyForm({ replyContent: "Hello", isSending: true })
    // Validate that the spinner is shown when isSending is true
    expect(screen.getByRole("status")).toBeDefined()
  })

  it("onSendReply called with message ID on send click", () => {
    // Mock the onSendReply function
    const onSendReply = vi.fn()

    // Call helper function to render component with the mocked onSendReply function
    renderReplyForm({ replyContent: "My reply", onSendReply })

    // Click the Send Reply button and validate that onSendReply was called with the message ID
    fireEvent.click(screen.getByText("Send Reply").closest("button")!)
    expect(onSendReply).toHaveBeenCalledWith(3)
  })

  it("recipient email shown in the form", () => {
    // Call helper function to render component
    renderReplyForm()

    // Validate that the recipient email is shown in the form as expected
    expect(screen.getByText("user@test.com")).toBeDefined()
  })
})

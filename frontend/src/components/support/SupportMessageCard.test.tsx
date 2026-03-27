import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { SupportMessageCard } from "./SupportMessageCard"
import type { SupportMessage } from "../../services/api/support"

// Mock child components to simplify testing of this component
vi.mock("./SupportMessageDetails", () => ({
  MessageMeta: ({ msg }: { msg: SupportMessage }) => (
    <div data-testid="message-meta">{msg.user.email}</div>
  ),
  MessageContent: ({ msg }: { msg: SupportMessage }) => (
    <div data-testid="message-content">{msg.subject}</div>
  ),
  AdminResponseHistory: ({
    msg,
    viewingHistory,
  }: {
    msg: SupportMessage
    viewingHistory: number | null
  }) => (
    <div data-testid="admin-response-history">
      {viewingHistory === msg.id ? "viewing" : "hidden"}
    </div>
  ),
  ReplyForm: ({
    msg,
    replyingTo,
  }: {
    msg: SupportMessage
    replyingTo: number | null
  }) => (
    <div data-testid="reply-form">
      {replyingTo === msg.id ? "replying" : "idle"}
    </div>
  ),
}))

// Define mock support messages to use in tests
const pendingMsg: SupportMessage = {
  id: 1,
  subject: "Help needed",
  message: "I need assistance",
  status: "Pending",
  created_at_str: "2024-01-01",
  user: { email: "user@test.com", public_id: "u1" },
  application_id: 10,
}

const repliedMsg: SupportMessage = {
  ...pendingMsg,
  id: 2,
  status: "Replied",
  admin_response: "We're on it",
}

// Define default props for the component for reuse across tests
const defaultProps = {
  replyingTo: null,
  setReplyingTo: vi.fn(),
  viewingHistory: null,
  setViewingHistory: vi.fn(),
  replyContent: "",
  setReplyContent: vi.fn(),
  onSendReply: vi.fn(),
  isSending: false,
}

describe("SupportMessageCard", () => {
  it("renders as expected", () => {
    // Render the component with default props and a pending message
    render(<SupportMessageCard {...defaultProps} msg={pendingMsg} />)

    // Validate that the main sections of the card are rendered
    expect(screen.getByTestId("message-meta")).toBeDefined()
    expect(screen.getByTestId("message-content")).toBeDefined()
    expect(screen.getByTestId("admin-response-history")).toBeDefined()
    expect(screen.getByTestId("reply-form")).toBeDefined()
  })

  it("message data passed to child components", () => {
    // Render the component with default props and a pending message
    render(<SupportMessageCard {...defaultProps} msg={pendingMsg} />)

    // Validate that the message data is passed correctly to the MessageMeta and MessageContent components
    expect(screen.getByText("user@test.com")).toBeDefined()
    expect(screen.getByText("Help needed")).toBeDefined()
  })

  it.each([
    { status: "Pending", msg: pendingMsg, color: "rgb(59, 130, 246)" },
    { status: "Replied", msg: repliedMsg, color: "rgb(16, 185, 129)" },
  ])("left border color correct for $status messages", ({ msg, color }) => {
    // Render the component with default props and the specified message
    const { container } = render(
      <SupportMessageCard {...defaultProps} msg={msg} />,
    )
    const card = container.firstElementChild as HTMLElement

    // Validate that the left border color of the card matches the expected color for the message status
    expect(card.style.borderLeft).toContain(color)
  })

  it.each([
    { prop: "replyingTo", expected: "replying" },
    { prop: "viewingHistory", expected: "viewing" },
  ])(
    "$prop state prop passed down to child component",
    ({ prop, expected }) => {
      // Render the component with default props and a pending message, and set the specified prop to the message ID
      render(
        <SupportMessageCard
          {...defaultProps}
          msg={pendingMsg}
          {...{ [prop]: pendingMsg.id }}
        />,
      )

      // Validate that the expected state is shown in the child component based on the prop that was set
      expect(screen.getByText(expected)).toBeDefined()
    },
  )

  it("idle/hidden state used when IDs do not match", () => {
    //  Render the component with default props and a pending message, and set replyingTo and viewingHistory to a different ID than the message ID
    render(
      <SupportMessageCard
        {...defaultProps}
        msg={pendingMsg}
        replyingTo={999}
        viewingHistory={999}
      />,
    )

    // Validate that the idle/hidden state is shown in the child components since the IDs do not match
    // Note not a great implemenation but fine for V1
    expect(screen.getByText("idle")).toBeDefined()
    expect(screen.getByText("hidden")).toBeDefined()
  })
})

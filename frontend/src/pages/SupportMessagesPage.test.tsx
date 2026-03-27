import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { SupportMessagesPage } from "./SupportMessagesPage"
import { useSupportManagement } from "../hooks/useSupportManagement"
import type { SupportMessage } from "../services/api/support"

vi.mock("../hooks/useSupportManagement")

const openMessage: SupportMessage = {
  id: 1,
  subject: "Grant application question",
  message: "Can you confirm my application was received?",
  status: "Open",
  created_at_str: "2026-03-20 09:00",
  user: {
    email: "member@example.com",
    public_id: "member-1",
  },
  application_id: 4,
}

const repliedMessage: SupportMessage = {
  id: 2,
  subject: "Award consideration follow-up",
  message: "I would like to understand the review timeline.",
  status: "Replied",
  created_at_str: "2026-03-21 10:00",
  user: {
    email: "applicant@example.com",
    public_id: "member-2",
  },
  application_id: 5,
  admin_response: "Your application is currently under review.",
  answered_at_str: "2026-03-21 14:30",
}

type SupportManagementState = ReturnType<typeof useSupportManagement>

function createSupportState(
  overrides: Partial<SupportManagementState> = {},
): SupportManagementState {
  return {
    filteredMessages: [],
    loading: false,
    error: null,
    setError: vi.fn(),
    statusFilter: "all",
    setStatusFilter: vi.fn(),
    searchQuery: "",
    setSearchQuery: vi.fn(),
    replyingTo: null,
    setReplyingTo: vi.fn(),
    viewingHistory: null,
    setViewingHistory: vi.fn(),
    replyContent: "",
    setReplyContent: vi.fn(),
    isSending: false,
    handleSendReply: vi.fn(),
    stats: {
      total: 0,
      pending: 0,
      replied: 0,
    },
    ...overrides,
  }
}

describe("SupportMessagesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should show the loading state while messages are loading", () => {
    vi.mocked(useSupportManagement).mockReturnValue(
      createSupportState({ loading: true }),
    )

    render(<SupportMessagesPage />)

    expect(
      screen.getByText("Gathering communication records..."),
    ).toBeInTheDocument()
  })

  it("should render the empty state with support filters and stats", () => {
    vi.mocked(useSupportManagement).mockReturnValue(createSupportState())

    render(<SupportMessagesPage />)

    expect(screen.getByText("Support Hub")).toBeInTheDocument()
    expect(
      screen.getByText("Manage and respond to initiative member inquiries"),
    ).toBeInTheDocument()
    expect(screen.getByText("Total Messages")).toBeInTheDocument()
    expect(screen.getByText("Pending Review")).toBeInTheDocument()
    expect(screen.getByText("Successfully Replied")).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText("Search by subject or user email..."),
    ).toBeInTheDocument()
    expect(screen.getByText("All (0)")).toBeInTheDocument()
    expect(screen.getByText("Pending (0)")).toBeInTheDocument()
    expect(screen.getByText("Replied (0)")).toBeInTheDocument()
    expect(screen.getByText("No messages found")).toBeInTheDocument()
  })

  it("should render support messages and allow dismissing an error", () => {
    const setError = vi.fn()

    vi.mocked(useSupportManagement).mockReturnValue(
      createSupportState({
        error: "Reply failed",
        setError,
        filteredMessages: [openMessage, repliedMessage],
        stats: {
          total: 2,
          pending: 1,
          replied: 1,
        },
      }),
    )

    const { container } = render(<SupportMessagesPage />)

    expect(screen.getByText("Reply failed")).toBeInTheDocument()
    expect(screen.getByText(openMessage.subject)).toBeInTheDocument()
    expect(screen.getByText(repliedMessage.subject)).toBeInTheDocument()
    expect(screen.getByText("Compose Response")).toBeInTheDocument()
    expect(screen.getByText("View Official Response")).toBeInTheDocument()

    const dismissButton = container.querySelector(".btn-close")
    expect(dismissButton).not.toBeNull()
    fireEvent.click(dismissButton!)

    expect(setError).toHaveBeenCalledWith(null)
  })

  it("should update the search query and status filters", () => {
    const setSearchQuery = vi.fn()
    const setStatusFilter = vi.fn()

    vi.mocked(useSupportManagement).mockReturnValue(
      createSupportState({
        setSearchQuery,
        setStatusFilter,
        stats: {
          total: 2,
          pending: 1,
          replied: 1,
        },
      }),
    )

    render(<SupportMessagesPage />)

    fireEvent.change(
      screen.getByPlaceholderText("Search by subject or user email..."),
      {
        target: { value: "award" },
      },
    )

    expect(setSearchQuery).toHaveBeenCalledWith("award")

    fireEvent.click(screen.getByRole("button", { name: "All (2)" }))
    fireEvent.click(screen.getByRole("button", { name: "Pending (1)" }))
    fireEvent.click(screen.getByRole("button", { name: "Replied (1)" }))

    expect(setStatusFilter).toHaveBeenNthCalledWith(1, "all")
    expect(setStatusFilter).toHaveBeenNthCalledWith(2, "pending")
    expect(setStatusFilter).toHaveBeenNthCalledWith(3, "replied")
  })

  it.each([
    {
      name: "open official response history for a replied message",
      message: repliedMessage,
      actionLabel: "View Official Response",
      expectedStats: { total: 1, pending: 0, replied: 1 },
      overrideKey: "setViewingHistory" as const,
    },
    {
      name: "open the reply composer for an open message",
      message: openMessage,
      actionLabel: "Compose Response",
      expectedStats: { total: 1, pending: 1, replied: 0 },
      overrideKey: "setReplyingTo" as const,
    },
  ])("should $name", ({ message, actionLabel, expectedStats, overrideKey }) => {
    const actionSpy = vi.fn()

    vi.mocked(useSupportManagement).mockReturnValue(
      createSupportState({
        filteredMessages: [message],
        [overrideKey]: actionSpy,
        stats: expectedStats,
      }),
    )

    render(<SupportMessagesPage />)

    fireEvent.click(screen.getByText(actionLabel))

    expect(actionSpy).toHaveBeenCalledWith(message.id)
  })

  it("should show the official response history when viewing a replied message", () => {
    const setViewingHistory = vi.fn()

    vi.mocked(useSupportManagement).mockReturnValue(
      createSupportState({
        filteredMessages: [repliedMessage],
        viewingHistory: repliedMessage.id,
        setViewingHistory,
        stats: {
          total: 1,
          pending: 0,
          replied: 1,
        },
      }),
    )

    const { container } = render(<SupportMessagesPage />)

    expect(screen.getByText("Official Response")).toBeInTheDocument()
    expect(screen.getByText(repliedMessage.admin_response!)).toBeInTheDocument()
    expect(screen.getByText("Sent at 2026-03-21 14:30")).toBeInTheDocument()

    const closeHistoryButton = container.querySelector(".link-success")
    expect(closeHistoryButton).not.toBeNull()
    fireEvent.click(closeHistoryButton!)

    expect(setViewingHistory).toHaveBeenCalledWith(null)
  })

  it("should show the reply form for an open message", () => {
    const setReplyingTo = vi.fn()
    const setReplyContent = vi.fn()
    const handleSendReply = vi.fn().mockResolvedValue(undefined)

    vi.mocked(useSupportManagement).mockReturnValue(
      createSupportState({
        filteredMessages: [openMessage],
        replyingTo: openMessage.id,
        setReplyingTo,
        replyContent: "Draft response",
        setReplyContent,
        handleSendReply,
        stats: {
          total: 1,
          pending: 1,
          replied: 0,
        },
      }),
    )

    const { container } = render(<SupportMessagesPage />)

    const textarea = screen.getByPlaceholderText(
      "Type your official response here...",
    )
    fireEvent.change(textarea, { target: { value: "Updated response" } })

    expect(setReplyContent).toHaveBeenCalledWith("Updated response")

    fireEvent.click(screen.getByRole("button", { name: /Send Reply/i }))
    expect(handleSendReply).toHaveBeenCalledWith(openMessage.id)

    const closeReplyButton = container.querySelector(".btn-link.text-muted")
    expect(closeReplyButton).not.toBeNull()
    fireEvent.click(closeReplyButton!)

    expect(setReplyingTo).toHaveBeenCalledWith(null)
  })
})

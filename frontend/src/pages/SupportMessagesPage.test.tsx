import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { SupportMessagesPage } from "./SupportMessagesPage"
import { useSupportManagement } from "../hooks/useSupportManagement"
import type { SupportMessage } from "../services/api/support"

// Mock dependencies
vi.mock("../hooks/useSupportManagement", () => ({
  useSupportManagement: vi.fn(),
}))

vi.mock("../components/support/SupportPageHeader", () => ({
  SupportPageHeader: () => <div data-testid="support-page-header">Header</div>,
}))

vi.mock("../components/support/SupportStatsCards", () => ({
  SupportStatsCards: ({
    pending,
    replied,
  }: {
    pending: number
    replied: number
  }) => (
    <div data-testid="support-stats-cards">
      Pending: {pending}, Replied: {replied}
    </div>
  ),
}))

vi.mock("../components/support/SupportFilterBar", () => ({
  SupportFilterBar: () => <div data-testid="support-filter-bar">FilterBar</div>,
}))

vi.mock("../components/support/SupportMessageCard", () => ({
  SupportMessageCard: ({ msg }: { msg: SupportMessage }) => (
    <div data-testid={`message-card-${msg.id}`}>{msg.subject}</div>
  ),
}))

// Define mock support messages to use in tests
const mockMessage: SupportMessage = {
  id: 1,
  subject: "Test Subject",
  message: "Test message body",
  status: "pending",
  created_at_str: "2024-01-01",
  user: { email: "test@example.com", public_id: "user-1" },
  application_id: 100,
}

const mockMessage2: SupportMessage = {
  id: 2,
  subject: "Another Subject",
  message: "Another message",
  status: "replied",
  created_at_str: "2024-01-02",
  user: { email: "user2@example.com", public_id: "user-2" },
  application_id: 101,
  admin_response: "We got it",
  answered_at_str: "2024-01-03",
}

// Mock the hook to return default values for all tests, and allow overriding in specific tests as needed
const defaultHookReturn = {
  filteredMessages: [mockMessage, mockMessage2],
  loading: false,
  error: null,
  setError: vi.fn(),
  statusFilter: "all" as const,
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
  stats: { total: 2, pending: 1, replied: 1 },
}

describe("SupportMessagesPage", () => {
  // Clear all mocks before each test
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSupportManagement).mockReturnValue(defaultHookReturn)
  })

  it("loading state rendered when loading prop set to true", () => {
    // Mock the hook to return loading state
    vi.mocked(useSupportManagement).mockReturnValue({
      ...defaultHookReturn,
      loading: true,
    })

    // Render the component
    render(<SupportMessagesPage />)

    // Validate that the loading indicator and message are shown when loading is true
    expect(screen.getByRole("status")).toBeDefined()
    expect(screen.getByText("Gathering communication records...")).toBeDefined()
  })

  it("page with header, stats, filter bar, and messages rendered whne successful", () => {
    // Render the component
    render(<SupportMessagesPage />)

    // Validate that main sections of the page are rendered
    expect(screen.getByTestId("support-page-header")).toBeDefined()
    expect(screen.getByTestId("support-stats-cards")).toBeDefined()
    expect(screen.getByTestId("support-filter-bar")).toBeDefined()
    expect(screen.getByTestId("message-card-1")).toBeDefined()
    expect(screen.getByTestId("message-card-2")).toBeDefined()
  })

  it("passes stats to SupportStatsCards", () => {
    // Render the component
    render(<SupportMessagesPage />)

    // Validate that the stats from the hook are passed to the SupportStatsCards component
    expect(screen.getByText("Pending: 1, Replied: 1")).toBeDefined()
  })

  it("renders message cards as expected", () => {
    // Render the component
    render(<SupportMessagesPage />)

    // Validate that message cards shown
    // Note these are rendered based on value in the hook
    expect(screen.getByText("Test Subject")).toBeDefined()
    expect(screen.getByText("Another Subject")).toBeDefined()
  })

  it("empty state shown when no messages match", () => {
    // Mock the hook to return empty messages array
    vi.mocked(useSupportManagement).mockReturnValue({
      ...defaultHookReturn,
      filteredMessages: [],
    })

    // Render the component
    render(<SupportMessagesPage />)

    // Validate that the empty state message is shown when there are no messages to display
    expect(screen.getByText("No messages found")).toBeDefined()
    expect(
      screen.getByText("Try adjusting your filters or search terms"),
    ).toBeDefined()
  })

  it("error alert shown when error is set", () => {
    // Mock the hook to return an error
    vi.mocked(useSupportManagement).mockReturnValue({
      ...defaultHookReturn,
      error: "Something went wrong",
    })

    // Render the component
    render(<SupportMessagesPage />)

    // Validate that the error alert is shown when error is set in the hook
    expect(screen.getByText("Something went wrong")).toBeDefined()
  })

  it("error dismissed when close button is clicked", () => {
    // Mock the hook to return an error and a mock setError function
    const setError = vi.fn()
    vi.mocked(useSupportManagement).mockReturnValue({
      ...defaultHookReturn,
      error: "Something went wrong",
      setError,
    })

    // Render the component
    render(<SupportMessagesPage />)

    // Click the close button on the error alert and validate that setError was called to clear the error
    const closeButton = screen.getByRole("button")
    fireEvent.click(closeButton)

    expect(setError).toHaveBeenCalledWith(null)
  })

  it("error alert not shown when error is null", () => {
    // Render the component with error set to null
    render(<SupportMessagesPage />)

    // Validate that the error alert is not shown when error is null
    expect(screen.queryByText("Something went wrong")).toBeNull()
  })

  it("message cards not shown in loading state", () => {
    // Mock the hook to return loading state
    vi.mocked(useSupportManagement).mockReturnValue({
      ...defaultHookReturn,
      loading: true,
    })

    // Render the component
    render(<SupportMessagesPage />)

    // Validate that message cards and main page content not shown when loading is true
    expect(screen.queryByTestId("message-card-1")).toBeNull()
    expect(screen.queryByTestId("support-page-header")).toBeNull()
  })
})

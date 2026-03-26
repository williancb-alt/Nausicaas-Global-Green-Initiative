import { renderHook, waitFor, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useSupportManagement } from "./useSupportManagement"
import { api } from "../services/api"
import type { SupportMessage } from "../services/api/support"
import { AxiosError } from "axios"

vi.mock("../services/api", () => ({
  api: {
    support: {
      getAllMessages: vi.fn(),
      replyToMessage: vi.fn(),
    },
  },
}))

const mockMessages: SupportMessage[] = [
  {
    id: 1,
    subject: "Grant question",
    message: "Need help",
    status: "open",
    created_at_str: "2026-01-01",
    user: { email: "alice@example.com", public_id: "u1" },
    application_id: 10,
  },
  {
    id: 2,
    subject: "Award inquiry",
    message: "Status update",
    status: "replied",
    created_at_str: "2026-01-02",
    user: { email: "bob@example.com", public_id: "u2" },
    application_id: 20,
  },
  {
    id: 3,
    subject: "Deadline extension",
    message: "Please extend",
    status: "open",
    created_at_str: "2026-01-03",
    user: { email: "carol@example.com", public_id: "u3" },
    application_id: 30,
  },
]

describe("useSupportManagement", () => {
  beforeEach(() => vi.clearAllMocks())

  it("should fetch messages on mount", async () => {
    vi.mocked(api.support.getAllMessages).mockResolvedValueOnce(mockMessages)

    const { result } = renderHook(() => useSupportManagement())

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.filteredMessages).toEqual(mockMessages)
    expect(result.current.error).toBeNull()
  })

  it("should compute stats from messages", async () => {
    vi.mocked(api.support.getAllMessages).mockResolvedValueOnce(mockMessages)

    const { result } = renderHook(() => useSupportManagement())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.stats).toEqual({
      total: 3,
      pending: 2,
      replied: 1,
    })
  })

  it("should handle fetch error", async () => {
    vi.mocked(api.support.getAllMessages).mockRejectedValueOnce(
      new Error("Network failure"),
    )

    const { result } = renderHook(() => useSupportManagement())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe("Network failure")
    expect(result.current.filteredMessages).toEqual([])
  })

  it("should handle AxiosError with API message", async () => {
    const axiosErr = new AxiosError("Request failed")
    axiosErr.response = {
      data: { message: "Unauthorized access" },
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config: { headers: {} as any },
    }
    vi.mocked(api.support.getAllMessages).mockRejectedValueOnce(axiosErr)

    const { result } = renderHook(() => useSupportManagement())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe("Unauthorized access")
  })

  it("should handle unknown error type", async () => {
    vi.mocked(api.support.getAllMessages).mockRejectedValueOnce(
      "string error",
    )

    const { result } = renderHook(() => useSupportManagement())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe("An unknown error occurred.")
  })

  it("should filter by pending status", async () => {
    vi.mocked(api.support.getAllMessages).mockResolvedValueOnce(mockMessages)

    const { result } = renderHook(() => useSupportManagement())

    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.setStatusFilter("pending"))

    expect(result.current.filteredMessages).toHaveLength(2)
    expect(result.current.filteredMessages.every(m => m.status === "open")).toBe(
      true,
    )
  })

  it("should filter by replied status", async () => {
    vi.mocked(api.support.getAllMessages).mockResolvedValueOnce(mockMessages)

    const { result } = renderHook(() => useSupportManagement())

    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.setStatusFilter("replied"))

    expect(result.current.filteredMessages).toHaveLength(1)
    expect(result.current.filteredMessages[0].id).toBe(2)
  })

  it("should filter by search query on subject", async () => {
    vi.mocked(api.support.getAllMessages).mockResolvedValueOnce(mockMessages)

    const { result } = renderHook(() => useSupportManagement())

    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.setSearchQuery("grant"))

    expect(result.current.filteredMessages).toHaveLength(1)
    expect(result.current.filteredMessages[0].id).toBe(1)
  })

  it("should filter by search query on email", async () => {
    vi.mocked(api.support.getAllMessages).mockResolvedValueOnce(mockMessages)

    const { result } = renderHook(() => useSupportManagement())

    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.setSearchQuery("bob@"))

    expect(result.current.filteredMessages).toHaveLength(1)
    expect(result.current.filteredMessages[0].id).toBe(2)
  })

  it("should combine status and search filters", async () => {
    vi.mocked(api.support.getAllMessages).mockResolvedValueOnce(mockMessages)

    const { result } = renderHook(() => useSupportManagement())

    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.setStatusFilter("pending")
      result.current.setSearchQuery("deadline")
    })

    expect(result.current.filteredMessages).toHaveLength(1)
    expect(result.current.filteredMessages[0].id).toBe(3)
  })

  it("should send reply and refresh messages", async () => {
    vi.mocked(api.support.getAllMessages).mockResolvedValueOnce(mockMessages)

    const { result } = renderHook(() => useSupportManagement())

    await waitFor(() => expect(result.current.loading).toBe(false))

    vi.mocked(api.support.replyToMessage).mockResolvedValueOnce({
      message: "Reply sent",
    })
    vi.mocked(api.support.getAllMessages).mockResolvedValueOnce(mockMessages)

    act(() => {
      result.current.setReplyingTo(1)
      result.current.setReplyContent("Thanks for reaching out")
    })

    await act(() => result.current.handleSendReply(1))

    expect(api.support.replyToMessage).toHaveBeenCalledWith(
      1,
      "Thanks for reaching out",
    )
    expect(result.current.replyContent).toBe("")
    expect(result.current.replyingTo).toBeNull()
    expect(result.current.viewingHistory).toBe(1)
  })

  it("should not send reply if content is empty", async () => {
    vi.mocked(api.support.getAllMessages).mockResolvedValueOnce(mockMessages)

    const { result } = renderHook(() => useSupportManagement())

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(() => result.current.handleSendReply(1))

    expect(api.support.replyToMessage).not.toHaveBeenCalled()
  })

  it("should handle reply error", async () => {
    vi.mocked(api.support.getAllMessages).mockResolvedValueOnce(mockMessages)

    const { result } = renderHook(() => useSupportManagement())

    await waitFor(() => expect(result.current.loading).toBe(false))

    vi.mocked(api.support.replyToMessage).mockRejectedValueOnce(
      new Error("Send failed"),
    )

    act(() => result.current.setReplyContent("Test reply"))

    await act(() => result.current.handleSendReply(1))

    expect(result.current.error).toBe("Send failed")
    expect(result.current.isSending).toBe(false)
  })
})

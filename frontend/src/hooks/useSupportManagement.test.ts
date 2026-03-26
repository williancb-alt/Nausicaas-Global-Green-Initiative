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

/** Render the hook with messages pre-loaded and wait for loading to finish. */
async function renderLoaded() {
  vi.mocked(api.support.getAllMessages).mockResolvedValueOnce(mockMessages)
  const { result } = renderHook(() => useSupportManagement())
  await waitFor(() => expect(result.current.loading).toBe(false))
  return result
}

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
    const result = await renderLoaded()
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

  it.each([
    {
      name: "pending status",
      status: "pending" as const,
      search: "",
      expectedLength: 2,
      expectedIds: [1, 3],
    },
    {
      name: "replied status",
      status: "replied" as const,
      search: "",
      expectedLength: 1,
      expectedIds: [2],
    },
    {
      name: "search query on subject",
      status: "all" as const,
      search: "grant",
      expectedLength: 1,
      expectedIds: [1],
    },
    {
      name: "search query on email",
      status: "all" as const,
      search: "bob@",
      expectedLength: 1,
      expectedIds: [2],
    },
    {
      name: "combined status and search",
      status: "pending" as const,
      search: "deadline",
      expectedLength: 1,
      expectedIds: [3],
    },
  ])(
    "should filter by $name",
    async ({ status, search, expectedLength, expectedIds }) => {
      const result = await renderLoaded()

      act(() => {
        if (status !== "all") result.current.setStatusFilter(status)
        if (search) result.current.setSearchQuery(search)
      })

      expect(result.current.filteredMessages).toHaveLength(expectedLength)
      expect(result.current.filteredMessages.map(m => m.id)).toEqual(
        expectedIds,
      )
    },
  )

  it("should send reply and refresh messages", async () => {
    const result = await renderLoaded()

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
    const result = await renderLoaded()

    await act(() => result.current.handleSendReply(1))

    expect(api.support.replyToMessage).not.toHaveBeenCalled()
  })

  it("should handle reply error", async () => {
    const result = await renderLoaded()

    vi.mocked(api.support.replyToMessage).mockRejectedValueOnce(
      new Error("Send failed"),
    )

    act(() => result.current.setReplyContent("Test reply"))

    await act(() => result.current.handleSendReply(1))

    expect(result.current.error).toBe("Send failed")
    expect(result.current.isSending).toBe(false)
  })
})

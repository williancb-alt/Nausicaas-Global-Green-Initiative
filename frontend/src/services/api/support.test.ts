import { beforeEach, describe, expect, it, vi } from "vitest"
import { supportApi } from "./support"
import { apiClient } from "./client"

vi.mock("./client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe("supportApi", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should create a support message", async () => {
    const payload = {
      application_id: 4,
      subject: "Need help",
      message: "Please review my submission details.",
    }
    const response = { message: "Support request submitted." }

    vi.mocked(apiClient.post).mockResolvedValue({ data: response })

    const result = await supportApi.createMessage(payload)

    expect(apiClient.post).toHaveBeenCalledWith("/api/v1/support", payload, {
      headers: { "Content-Type": "application/json" },
    })
    expect(result).toEqual(response)
  })

  it("should fetch all support messages", async () => {
    const response = [
      {
        id: 7,
        subject: "Question about award review",
        message: "Can you confirm my application was received?",
        status: "open",
        created_at_str: "2026-03-25 10:00",
        user: {
          email: "user@example.com",
          public_id: "public-id-123",
        },
        application_id: 4,
      },
    ]

    vi.mocked(apiClient.get).mockResolvedValue({ data: response })

    const result = await supportApi.getAllMessages()

    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/support")
    expect(result).toEqual(response)
  })

  it("should reply to a support message", async () => {
    const response = { message: "Reply sent successfully." }

    vi.mocked(apiClient.post).mockResolvedValue({ data: response })

    const result = await supportApi.replyToMessage(
      7,
      "Thanks, your application is under review.",
    )

    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/v1/support/7/reply",
      {
        message: "Thanks, your application is under review.",
      },
      {
        headers: { "Content-Type": "application/json" },
      },
    )
    expect(result).toEqual(response)
  })
})

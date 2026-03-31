import { describe, it, expect, vi, beforeEach } from "vitest"

const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

// Must import after stubbing fetch
const { apiClient } = await import("./client")

function jsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  } as Response
}

describe("apiClient", () => {
  describe("GET", () => {
    it("should fetch with correct URL", async () => {
      mockFetch.mockResolvedValue(jsonResponse({ name: "test" }))

      const result = await apiClient.get("/api/v1/test")
      expect(result.data).toEqual({ name: "test" })
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/test"),
        expect.objectContaining({ method: "GET", credentials: "include" }),
      )
    })

    it("should append query params", async () => {
      mockFetch.mockResolvedValue(jsonResponse([]))

      await apiClient.get("/api/v1/items", {
        params: { page: 1, per_page: 10 },
      })
      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain("page=1")
      expect(url).toContain("per_page=10")
    })
  })

  describe("POST", () => {
    it("should send URLSearchParams as form-urlencoded", async () => {
      mockFetch.mockResolvedValue(jsonResponse({ status: "success" }))

      await apiClient.post(
        "/api/v1/auth/login",
        new URLSearchParams({ email: "a@b.com" }),
      )
      const init = mockFetch.mock.calls[0][1] as RequestInit
      expect(init.headers).toHaveProperty(
        "Content-Type",
        "application/x-www-form-urlencoded",
      )
    })

    it("should send objects as JSON", async () => {
      mockFetch.mockResolvedValue(jsonResponse({ status: "success" }))

      await apiClient.post(
        "/api/v1/applications",
        { grant_name: "test" },
        { headers: { "Content-Type": "application/json" } },
      )
      const init = mockFetch.mock.calls[0][1] as RequestInit
      expect(init.body).toBe(JSON.stringify({ grant_name: "test" }))
    })
  })

  describe("PUT", () => {
    it("should send PUT request", async () => {
      mockFetch.mockResolvedValue(jsonResponse({ status: "success" }))

      await apiClient.put(
        "/api/v1/grants/test",
        new URLSearchParams({ deadline: "12/31/24" }),
      )
      const init = mockFetch.mock.calls[0][1] as RequestInit
      expect(init.method).toBe("PUT")
    })
  })

  describe("DELETE", () => {
    it("should send DELETE request", async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 204 } as Response)

      await apiClient.delete("/api/v1/grants/test")
      const init = mockFetch.mock.calls[0][1] as RequestInit
      expect(init.method).toBe("DELETE")
    })
  })

  describe("error handling", () => {
    it("should throw with response message", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse({ message: "Unauthorized access" }, 401),
      )

      await expect(apiClient.get("/api/v1/test")).rejects.toThrow(
        "Unauthorized access",
      )
    })

    it("should throw with response error field", async () => {
      mockFetch.mockResolvedValue(jsonResponse({ error: "Not found" }, 404))

      await expect(apiClient.get("/api/v1/test")).rejects.toThrow("Not found")
    })

    it("should use HTTP status when no message available", async () => {
      mockFetch.mockResolvedValue(jsonResponse({}, 500))

      await expect(apiClient.get("/api/v1/test")).rejects.toThrow(
        "HTTP error 500",
      )
    })

    it("should include field-specific validation errors", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse(
          {
            message: "Validation failed",
            errors: { email: "is invalid", name: "is required" },
          },
          422,
        ),
      )

      await expect(apiClient.get("/api/v1/test")).rejects.toThrow(
        "Validation failed - email: is invalid; name: is required",
      )
    })

    it("should not append field errors when errors object is empty", async () => {
      mockFetch.mockResolvedValue(
        jsonResponse({ message: "Bad request", errors: {} }, 400),
      )

      await expect(apiClient.get("/api/v1/test")).rejects.toThrow("Bad request")
    })
  })
})

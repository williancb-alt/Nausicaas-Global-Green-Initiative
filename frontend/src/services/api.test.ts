import { describe, it, expect, vi, beforeEach } from "vitest"
import { api, type AuthSuccess, type Grant, type GrantPage } from "./api"

const mockFetch = vi.fn() as unknown as typeof fetch
globalThis.fetch = mockFetch

const BASE = "http://localhost:4000/v1"

function createMockResponse(data: unknown, ok = true, status = 200): Response {
  const jsonData = JSON.stringify(data)
  return {
    ok,
    status,
    statusText: ok ? "OK" : "Error",
    headers: new Headers(),
    body: null,
    bodyUsed: false,
    redirected: false,
    type: "default" as ResponseType,
    url: "",
    clone: vi.fn(),
    arrayBuffer: vi.fn(),
    blob: vi.fn(),
    bytes: vi.fn(),
    formData: vi.fn(),
    text: () => Promise.resolve(jsonData),
    json: () => Promise.resolve(data),
  } as Response
}

describe("api (auth + grants)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv("VITE_API_BASE_URL", BASE)
  })

  describe("login", () => {
    it("returns token on success", async () => {
      const mockAuth: AuthSuccess = {
        status: "success",
        message: "logged in",
        access_token: "token123",
        token_type: "bearer",
        expires_in: 3600,
      }
      vi.mocked(mockFetch).mockResolvedValueOnce(createMockResponse(mockAuth))

      const res = await api.login("user@test.com", "pw")

      expect(res).toEqual(mockAuth)
      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE}/api/v1/auth/login`,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/x-www-form-urlencoded",
          }),
          body: expect.any(URLSearchParams),
        }),
      )
    })
  })

  describe("createGrant", () => {
    it("creates a grant with form data", async () => {
      vi.mocked(mockFetch).mockResolvedValueOnce(
        createMockResponse({
          status: "success",
          message: "New grant added: test.",
        }),
      )

      await api.createGrant("token123", {
        name: "test",
        deadline: "01/01/2026",
      })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE}/api/v1/grants`,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer token123",
            "Content-Type": "application/x-www-form-urlencoded",
          }),
          body: expect.any(URLSearchParams),
        }),
      )
    })
  })

  describe("listGrants", () => {
    it("fetches paginated grants", async () => {
      const mockPage: GrantPage = {
        links: { self: "", first: "", last: "" },
        has_prev: false,
        has_next: false,
        page: 1,
        total_pages: 1,
        items_per_page: 5,
        total_items: 1,
        items: [
          {
            name: "grant-1",
            deadline: "01/01/2026",
            deadline_passed: false,
            time_remaining: "10d",
          } as Grant,
        ],
      }
      vi.mocked(mockFetch).mockResolvedValueOnce(createMockResponse(mockPage))

      const res = await api.listGrants("token123", 1, 5)

      expect(res).toEqual(mockPage)
      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE}/api/v1/grants?page=1&per_page=5`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer token123",
          }),
        }),
      )
    })
  })

  describe("getGrant", () => {
    it("fetches a grant by name", async () => {
      const mockGrant: Grant = {
        name: "grant-1",
        deadline: "01/01/2026",
        deadline_passed: false,
        time_remaining: "10d",
      }
      vi.mocked(mockFetch).mockResolvedValueOnce(createMockResponse(mockGrant))

      const res = await api.getGrant("token123", "grant-1")

      expect(res).toEqual(mockGrant)
      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE}/api/v1/grants/grant-1`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer token123",
          }),
        }),
      )
    })
  })

  describe("updateGrant", () => {
    it("updates a grant deadline", async () => {
      vi.mocked(mockFetch).mockResolvedValueOnce(
        createMockResponse({ status: "success", message: "updated" }),
      )

      await api.updateGrant("token123", "grant-1", { deadline: "02/02/2026" })

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE}/api/v1/grants/grant-1`,
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            Authorization: "Bearer token123",
            "Content-Type": "application/x-www-form-urlencoded",
          }),
          body: expect.any(URLSearchParams),
        }),
      )
    })
  })

  describe("deleteGrant", () => {
    it("deletes a grant", async () => {
      vi.mocked(mockFetch).mockResolvedValueOnce(createMockResponse({}))

      await api.deleteGrant("token123", "grant-1")

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE}/api/v1/grants/grant-1`,
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            Authorization: "Bearer token123",
          }),
        }),
      )
    })
  })
})

import { describe, it, expect, vi, beforeEach } from "vitest"
import type { AuthSuccess, Award, AwardPage, Grant, GrantPage } from "./client"
import { api } from "./index"

const { mockPost, mockGet, mockPut, mockDelete } = vi.hoisted(() => {
  return {
    mockPost: vi.fn(),
    mockGet: vi.fn(),
    mockPut: vi.fn(),
    mockDelete: vi.fn(),
  }
})

vi.mock("axios", () => {
  const mockAxiosInstance = {
    post: mockPost,
    get: mockGet,
    put: mockPut,
    delete: mockDelete,
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: { baseURL: "http://localhost:4000/v1" },
  }

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

const TEST_EMAIL = "test@example.com"
const TEST_PASSWORD = "password123"
const PAGE = 1
const PER_PAGE = 10
const urlSearchParams = expect.any(URLSearchParams)

function mockDataResponse<T>(method: ReturnType<typeof vi.fn>, response: T) {
  method.mockResolvedValue({ data: response })
}

async function expectDataRequest<T>({
  method,
  response,
  execute,
  expectedArgs,
}: {
  method: ReturnType<typeof vi.fn>
  response: T
  execute: () => Promise<T>
  expectedArgs: unknown[]
}) {
  mockDataResponse(method, response)

  await expect(execute()).resolves.toEqual(response)
  expect(method).toHaveBeenCalledWith(...expectedArgs)
}

async function expectDeleteRequest(
  execute: () => Promise<void>,
  ...expectedArgs: unknown[]
) {
  mockDelete.mockResolvedValue({ status: 204 })

  await execute()
  expect(mockDelete).toHaveBeenCalledWith(...expectedArgs)
}

describe("api (auth)", () => {
  describe("auth.register", () => {
    it("should register a new user", async () => {
      const mockResponse: AuthSuccess = {
        status: "success",
        message: "successfully registered",
        token_type: "bearer",
        expires_in: 900,
      }

      await expectDataRequest({
        method: mockPost,
        response: mockResponse,
        execute: () => api.auth.register(TEST_EMAIL, TEST_PASSWORD),
        expectedArgs: ["/api/v1/auth/register", urlSearchParams],
      })
    })
  })

  describe("auth.login", () => {
    it("should login a user", async () => {
      const mockResponse: AuthSuccess = {
        status: "success",
        message: "successfully logged in",
        token_type: "bearer",
        expires_in: 900,
      }

      await expectDataRequest({
        method: mockPost,
        response: mockResponse,
        execute: () => api.auth.login(TEST_EMAIL, TEST_PASSWORD),
        expectedArgs: ["/api/v1/auth/login", urlSearchParams],
      })
    })
  })

  describe("auth.getUser", () => {
    it("should get user info", async () => {
      const mockResponse = {
        email: "test@example.com",
        admin: false,
        public_id: "123",
      }

      await expectDataRequest({
        method: mockGet,
        response: mockResponse,
        execute: () => api.auth.getUser(),
        expectedArgs: ["/api/v1/auth/user"],
      })
    })
  })

  describe("auth.logout", () => {
    it("should logout a user", async () => {
      const mockResponse = {
        status: "success",
        message: "successfully logged out",
      }

      await expectDataRequest({
        method: mockPost,
        response: mockResponse,
        execute: () => api.auth.logout(),
        expectedArgs: ["/api/v1/auth/logout"],
      })
    })
  })
})

describe("api (awards)", () => {
  describe("awards.createAward", () => {
    it("should create an award", async () => {
      const mockResponse = {
        status: "success",
        message: "New award added: test-award.",
      }

      await expectDataRequest({
        method: mockPost,
        response: mockResponse,
        execute: () =>
          api.awards.createAward({
            name: "test-award",
            deadline: "12/31/2024",
            description: "Test award description",
          }),
        expectedArgs: ["/api/v1/awards", urlSearchParams],
      })
    })
  })

  describe("awards.listAwards", () => {
    it("should list awards", async () => {
      const mockResponse: AwardPage = {
        links: {
          self: "/api/v1/awards?page=1&per_page=10",
          first: "/api/v1/awards?page=1&per_page=10",
          last: "/api/v1/awards?page=1&per_page=10",
        },
        has_prev: false,
        has_next: false,
        page: 1,
        total_pages: 1,
        items_per_page: 10,
        total_items: 1,
        items: [
          {
            name: "test-award",
            deadline: "2024-12-31",
            deadline_passed: false,
            time_remaining: "30 days",
          },
        ],
      }

      await expectDataRequest({
        method: mockGet,
        response: mockResponse,
        execute: () => api.awards.listAwards(PAGE, PER_PAGE),
        expectedArgs: ["/api/v1/awards", { params: { page: PAGE, per_page: PER_PAGE } }],
      })
    })
  })

  describe("awards.getAward", () => {
    it("should get a single award", async () => {
      const mockResponse: Award = {
        name: "test-award",
        deadline: "2024-12-31",
        deadline_passed: false,
        time_remaining: "30 days",
      }

      await expectDataRequest({
        method: mockGet,
        response: mockResponse,
        execute: () => api.awards.getAward("test-award"),
        expectedArgs: ["/api/v1/awards/test-award"],
      })
    })
  })

  describe("awards.updateAward", () => {
    it("should update an award", async () => {
      const mockResponse: Award = {
        name: "test-award",
        deadline: "2025-01-31",
        deadline_passed: false,
        time_remaining: "60 days",
      }

      await expectDataRequest({
        method: mockPut,
        response: mockResponse,
        execute: () =>
          api.awards.updateAward("test-award", {
            deadline: "01/31/2025",
          }),
        expectedArgs: ["/api/v1/awards/test-award", urlSearchParams],
      })
    })
  })

  describe("awards.deleteAward", () => {
    it("should delete an award", async () => {
      await expectDeleteRequest(
        () => api.awards.deleteAward("test-award"),
        "/api/v1/awards/test-award",
      )
    })
  })
})

describe("api (grants)", () => {
  describe("grants.createGrant", () => {
    it("should create a grant", async () => {
      const mockResponse = {
        status: "success",
        message: "New grant added: test-grant.",
      }

      await expectDataRequest({
        method: mockPost,
        response: mockResponse,
        execute: () =>
          api.grants.createGrant({
            name: "test-grant",
            deadline: "12/31/2024",
            description: "Test grant description",
          }),
        expectedArgs: ["/api/v1/grants", urlSearchParams],
      })
    })
  })

  describe("grants.listGrants", () => {
    it("should list grants", async () => {
      const mockResponse: GrantPage = {
        links: {
          self: "/api/v1/grants?page=1&per_page=10",
          first: "/api/v1/grants?page=1&per_page=10",
          last: "/api/v1/grants?page=1&per_page=10",
        },
        has_prev: false,
        has_next: false,
        page: 1,
        total_pages: 1,
        items_per_page: 10,
        total_items: 1,
        items: [
          {
            name: "test-grant",
            deadline: "2024-12-31",
            deadline_passed: false,
            time_remaining: "30 days",
          },
        ],
      }

      await expectDataRequest({
        method: mockGet,
        response: mockResponse,
        execute: () => api.grants.listGrants(PAGE, PER_PAGE),
        expectedArgs: ["/api/v1/grants", { params: { page: PAGE, per_page: PER_PAGE } }],
      })
    })
  })

  describe("grants.getGrant", () => {
    it("should get a single grant", async () => {
      const mockResponse: Grant = {
        name: "test-grant",
        deadline: "2024-12-31",
        deadline_passed: false,
        time_remaining: "30 days",
      }

      await expectDataRequest({
        method: mockGet,
        response: mockResponse,
        execute: () => api.grants.getGrant("test-grant"),
        expectedArgs: ["/api/v1/grants/test-grant"],
      })
    })
  })

  describe("grants.updateGrant", () => {
    it("should update a grant", async () => {
      const mockResponse: Grant = {
        name: "test-grant",
        deadline: "2025-01-31",
        deadline_passed: false,
        time_remaining: "60 days",
      }

      await expectDataRequest({
        method: mockPut,
        response: mockResponse,
        execute: () =>
          api.grants.updateGrant("test-grant", {
            deadline: "01/31/2025",
          }),
        expectedArgs: ["/api/v1/grants/test-grant", urlSearchParams],
      })
    })
  })

  describe("grants.deleteGrant", () => {
    it("should delete a grant", async () => {
      await expectDeleteRequest(
        () => api.grants.deleteGrant("test-grant"),
        "/api/v1/grants/test-grant",
      )
    })
  })
})

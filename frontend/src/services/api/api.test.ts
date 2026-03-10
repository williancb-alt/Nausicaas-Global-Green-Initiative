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
const CREATED_DEADLINE = "12/31/2024"
const UPDATED_DEADLINE = "01/31/2025"
const RESOURCE_DEADLINE = "2024-12-31"
const UPDATED_RESOURCE_DEADLINE = "2025-01-31"
const RESOURCE_TIME_REMAINING = "30 days"
const UPDATED_RESOURCE_TIME_REMAINING = "60 days"
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

function buildAuthSuccess(message: string): AuthSuccess {
  return {
    status: "success",
    message,
    token_type: "bearer",
    expires_in: 900,
  }
}

function buildResource(name: string, overrides?: Partial<Award>): Award {
  return {
    name,
    deadline: RESOURCE_DEADLINE,
    deadline_passed: false,
    time_remaining: RESOURCE_TIME_REMAINING,
    ...overrides,
  }
}

function buildPage<TItem>(basePath: string, item: TItem): AwardPage & { items: TItem[] } {
  return {
    links: {
      self: `${basePath}?page=${PAGE}&per_page=${PER_PAGE}`,
      first: `${basePath}?page=${PAGE}&per_page=${PER_PAGE}`,
      last: `${basePath}?page=${PAGE}&per_page=${PER_PAGE}`,
    },
    has_prev: false,
    has_next: false,
    page: PAGE,
    total_pages: 1,
    items_per_page: PER_PAGE,
    total_items: 1,
    items: [item],
  }
}

function buildCreatePayload(resourceType: string, resourceName: string) {
  return {
    name: resourceName,
    deadline: CREATED_DEADLINE,
    description: `Test ${resourceType} description`,
  }
}

function describeResourceApi<
  TResource extends Award,
  TPage extends { items: TResource[] },
>({
  groupName,
  resourceLabel,
  basePath,
  resourceName,
  apiResource,
}: {
  groupName: string
  resourceLabel: string
  basePath: string
  resourceName: string
  apiResource: {
    create: (payload: {
      name: string
      deadline: string
      description: string
    }) => Promise<unknown>
    list: (page: number, perPage: number) => Promise<TPage>
    get: (name: string) => Promise<TResource>
    update: (name: string, payload: { deadline: string }) => Promise<TResource>
    delete: (name: string) => Promise<void>
  }
}) {
  describe(groupName, () => {
    it(`should create a ${resourceLabel}`, async () => {
      const response = {
        status: "success",
        message: `New ${resourceLabel} added: ${resourceName}.`,
      }

      await expectDataRequest({
        method: mockPost,
        response,
        execute: () => apiResource.create(buildCreatePayload(resourceLabel, resourceName)),
        expectedArgs: [basePath, urlSearchParams],
      })
    })

    it(`should list ${resourceLabel}s`, async () => {
      const response = buildPage(basePath, buildResource(resourceName)) as TPage

      await expectDataRequest({
        method: mockGet,
        response,
        execute: () => apiResource.list(PAGE, PER_PAGE),
        expectedArgs: [basePath, { params: { page: PAGE, per_page: PER_PAGE } }],
      })
    })

    it(`should get a single ${resourceLabel}`, async () => {
      const response = buildResource(resourceName) as TResource

      await expectDataRequest({
        method: mockGet,
        response,
        execute: () => apiResource.get(resourceName),
        expectedArgs: [`${basePath}/${resourceName}`],
      })
    })

    it(`should update a ${resourceLabel}`, async () => {
      const response = buildResource(resourceName, {
        deadline: UPDATED_RESOURCE_DEADLINE,
        time_remaining: UPDATED_RESOURCE_TIME_REMAINING,
      }) as TResource

      await expectDataRequest({
        method: mockPut,
        response,
        execute: () => apiResource.update(resourceName, { deadline: UPDATED_DEADLINE }),
        expectedArgs: [`${basePath}/${resourceName}`, urlSearchParams],
      })
    })

    it(`should delete a ${resourceLabel}`, async () => {
      await expectDeleteRequest(
        () => apiResource.delete(resourceName),
        `${basePath}/${resourceName}`,
      )
    })
  })
}

describe("api (auth)", () => {
  describe("auth.register", () => {
    it("should register a new user", async () => {
      const mockResponse = buildAuthSuccess("successfully registered")

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
      const mockResponse = buildAuthSuccess("successfully logged in")

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
  describeResourceApi<Award, AwardPage>({
    groupName: "awards",
    resourceLabel: "award",
    basePath: "/api/v1/awards",
    resourceName: "test-award",
    apiResource: {
      create: api.awards.createAward,
      list: api.awards.listAwards,
      get: api.awards.getAward,
      update: api.awards.updateAward,
      delete: api.awards.deleteAward,
    },
  })
})

describe("api (grants)", () => {
  describeResourceApi<Grant, GrantPage>({
    groupName: "grants",
    resourceLabel: "grant",
    basePath: "/api/v1/grants",
    resourceName: "test-grant",
    apiResource: {
      create: api.grants.createGrant,
      list: api.grants.listGrants,
      get: api.grants.getGrant,
      update: api.grants.updateGrant,
      delete: api.grants.deleteGrant,
    },
  })
})

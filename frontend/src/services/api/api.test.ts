import { describe, it, expect, vi, beforeEach } from "vitest"
import type {
  AuthSuccess,
  Award,
  AwardPage,
  BaseResponse,
  Grant,
  GrantPage,
  UserInfo,
} from "./client"
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

type ResourceRecord = Award | Grant
type ResourcePageRecord = AwardPage | GrantPage

type AuthScenario = {
  endpoint: string
  successMessage: AuthSuccess["message"]
  execute: () => Promise<AuthSuccess>
}

type ResourceScenario<TResource extends ResourceRecord, TPage extends ResourcePageRecord> = {
  suiteName: string
  resourceLabel: "award" | "grant"
  basePath: string
  resource: TResource
  listResponse: TPage
  create: () => Promise<BaseResponse>
  list: () => Promise<TPage>
  get: () => Promise<TResource>
  update: () => Promise<BaseResponse | TResource>
  remove: () => Promise<void>
}

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
  execute: () => Promise<unknown>
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

function buildAuthSuccess(scenario: Pick<AuthScenario, "successMessage">): AuthSuccess {
  return {
    status: "success",
    message: scenario.successMessage,
    token_type: "bearer",
    expires_in: 900,
  }
}

function buildResource<TResource extends ResourceRecord>({
  resource,
  overrides,
}: {
  resource: TResource
  overrides?: Partial<TResource>
}): TResource {
  return {
    ...resource,
    deadline: RESOURCE_DEADLINE,
    deadline_passed: false,
    time_remaining: RESOURCE_TIME_REMAINING,
    ...overrides,
  } as TResource
}

function buildPage<TItem>({
  basePath,
  item,
}: {
  basePath: string
  item: TItem
}): {
  links: AwardPage["links"]
  has_prev: boolean
  has_next: boolean
  page: number
  total_pages: number
  items_per_page: number
  total_items: number
  items: TItem[]
} {
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

function buildCreatePayload(
  scenario: Pick<ResourceScenario<ResourceRecord, ResourcePageRecord>, "resourceLabel" | "resource">,
) {
  return {
    name: scenario.resource.name,
    deadline: CREATED_DEADLINE,
    description: `Test ${scenario.resourceLabel} description`,
  }
}

function describeResourceApi<
  TResource extends ResourceRecord,
  TPage extends ResourcePageRecord,
>(scenario: ResourceScenario<TResource, TPage>) {
  describe(scenario.suiteName, () => {
    it(`should create a ${scenario.resourceLabel}`, async () => {
      const response = {
        status: "success",
        message: `New ${scenario.resourceLabel} added: ${scenario.resource.name}.`,
      }

      await expectDataRequest({
        method: mockPost,
        response,
        execute: scenario.create,
        expectedArgs: [scenario.basePath, urlSearchParams],
      })
    })

    it(`should list ${scenario.resourceLabel}s`, async () => {
      await expectDataRequest({
        method: mockGet,
        response: scenario.listResponse,
        execute: scenario.list,
        expectedArgs: [scenario.basePath, { params: { page: PAGE, per_page: PER_PAGE } }],
      })
    })

    it(`should get a single ${scenario.resourceLabel}`, async () => {
      const response = buildResource({ resource: scenario.resource }) as TResource

      await expectDataRequest({
        method: mockGet,
        response,
        execute: scenario.get,
        expectedArgs: [`${scenario.basePath}/${scenario.resource.name}`],
      })
    })

    it(`should update a ${scenario.resourceLabel}`, async () => {
      const response = buildResource({
        resource: scenario.resource,
        overrides: {
          deadline: UPDATED_RESOURCE_DEADLINE,
          time_remaining: UPDATED_RESOURCE_TIME_REMAINING,
        } as Partial<TResource>,
      }) as TResource

      await expectDataRequest({
        method: mockPut,
        response,
        execute: scenario.update,
        expectedArgs: [`${scenario.basePath}/${scenario.resource.name}`, urlSearchParams],
      })
    })

    it(`should delete a ${scenario.resourceLabel}`, async () => {
      await expectDeleteRequest(scenario.remove, `${scenario.basePath}/${scenario.resource.name}`)
    })
  })
}

const awardResource: Award = {
  name: "test-award",
  deadline: RESOURCE_DEADLINE,
  deadline_passed: false,
  time_remaining: RESOURCE_TIME_REMAINING,
}

const awardScenario: ResourceScenario<Award, AwardPage> = {
  suiteName: "awards",
  resourceLabel: "award",
  basePath: "/api/v1/awards",
  resource: awardResource,
  listResponse: buildPage({
    basePath: "/api/v1/awards",
    item: buildResource({ resource: awardResource }),
  }),
  create: () =>
    api.awards.createAward(
      buildCreatePayload({
        resourceLabel: "award",
        resource: awardResource,
      }),
    ),
  list: () => api.awards.listAwards(PAGE, PER_PAGE),
  get: () => api.awards.getAward("test-award"),
  update: () => api.awards.updateAward("test-award", { deadline: UPDATED_DEADLINE }),
  remove: () => api.awards.deleteAward("test-award"),
}

const grantResource: Grant = {
  name: "test-grant",
  deadline: RESOURCE_DEADLINE,
  deadline_passed: false,
  time_remaining: RESOURCE_TIME_REMAINING,
}

const grantScenario: ResourceScenario<Grant, GrantPage> = {
  suiteName: "grants",
  resourceLabel: "grant",
  basePath: "/api/v1/grants",
  resource: grantResource,
  listResponse: buildPage({
    basePath: "/api/v1/grants",
    item: buildResource({ resource: grantResource }),
  }),
  create: () =>
    api.grants.createGrant(
      buildCreatePayload({
        resourceLabel: "grant",
        resource: grantResource,
      }),
    ),
  list: () => api.grants.listGrants(PAGE, PER_PAGE),
  get: () => api.grants.getGrant("test-grant"),
  update: () => api.grants.updateGrant("test-grant", { deadline: UPDATED_DEADLINE }),
  remove: () => api.grants.deleteGrant("test-grant"),
}

describe("api (auth)", () => {
  describe("auth.register", () => {
    it("should register a new user", async () => {
      const scenario: AuthScenario = {
        endpoint: "/api/v1/auth/register",
        successMessage: "successfully registered",
        execute: () => api.auth.register(TEST_EMAIL, TEST_PASSWORD),
      }
      const mockResponse = buildAuthSuccess(scenario)

      await expectDataRequest({
        method: mockPost,
        response: mockResponse,
        execute: scenario.execute,
        expectedArgs: [scenario.endpoint, urlSearchParams],
      })
    })
  })

  describe("auth.login", () => {
    it("should login a user", async () => {
      const scenario: AuthScenario = {
        endpoint: "/api/v1/auth/login",
        successMessage: "successfully logged in",
        execute: () => api.auth.login(TEST_EMAIL, TEST_PASSWORD),
      }
      const mockResponse = buildAuthSuccess(scenario)

      await expectDataRequest({
        method: mockPost,
        response: mockResponse,
        execute: scenario.execute,
        expectedArgs: [scenario.endpoint, urlSearchParams],
      })
    })
  })

  describe("auth.getUser", () => {
    it("should get user info", async () => {
      const mockResponse: UserInfo = {
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
  describeResourceApi(awardScenario)
})

describe("api (grants)", () => {
  describeResourceApi(grantScenario)
})

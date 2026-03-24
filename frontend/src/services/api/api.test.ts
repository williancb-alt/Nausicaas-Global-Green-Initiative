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
const urlSearchParams: unknown = expect.any(URLSearchParams)

type ResourceRecord = Award | Grant
type ResourcePageRecord = AwardPage | GrantPage

type ResourceScenario<
  TResource extends ResourceRecord,
  TPage extends ResourcePageRecord,
> = {
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

function buildAuthSuccess(message: AuthSuccess["message"]): AuthSuccess {
  return {
    status: "success",
    message,
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
  scenario: Pick<
    ResourceScenario<ResourceRecord, ResourcePageRecord>,
    "resourceLabel" | "resource"
  >,
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
        expectedArgs: [
          scenario.basePath,
          { params: { page: PAGE, per_page: PER_PAGE } },
        ],
      })
    })

    it(`should get a single ${scenario.resourceLabel}`, async () => {
      const response = buildResource({ resource: scenario.resource })

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
      })

      await expectDataRequest({
        method: mockPut,
        response,
        execute: scenario.update,
        expectedArgs: [
          `${scenario.basePath}/${scenario.resource.name}`,
          urlSearchParams,
        ],
      })
    })

    it(`should delete a ${scenario.resourceLabel}`, async () => {
      await expectDeleteRequest(
        scenario.remove,
        `${scenario.basePath}/${scenario.resource.name}`,
      )
    })
  })
}

function buildResourceScenario<
  TResource extends ResourceRecord,
  TPage extends ResourcePageRecord,
>({
  label,
  apiNamespace,
}: {
  label: "award" | "grant"
  apiNamespace: {
    create: (payload: any) => Promise<BaseResponse>
    list: (page: number, perPage: number) => Promise<TPage>
    get: (name: string) => Promise<TResource>
    update: (name: string, data: any) => Promise<BaseResponse | TResource>
    delete: (name: string) => Promise<void>
  }
}): ResourceScenario<TResource, TPage> {
  const name = `test-${label}`
  const basePath = `/api/v1/${label}s`
  const resource = {
    name,
    deadline: RESOURCE_DEADLINE,
    deadline_passed: false,
    time_remaining: RESOURCE_TIME_REMAINING,
  } as TResource

  return {
    suiteName: `${label}s`,
    resourceLabel: label,
    basePath,
    resource,
    listResponse: buildPage({
      basePath,
      item: buildResource({ resource }),
    }) as unknown as TPage,
    create: () =>
      apiNamespace.create(
        buildCreatePayload({ resourceLabel: label, resource }),
      ),
    list: () => apiNamespace.list(PAGE, PER_PAGE),
    get: () => apiNamespace.get(name),
    update: () => apiNamespace.update(name, { deadline: UPDATED_DEADLINE }),
    remove: () => apiNamespace.delete(name),
  }
}

const awardScenario = buildResourceScenario<Award, AwardPage>({
  label: "award",
  apiNamespace: {
    create: p => api.awards.createAward(p),
    list: (page, perPage) => api.awards.listAwards(page, perPage),
    get: name => api.awards.getAward(name),
    update: (name, data) => api.awards.updateAward(name, data),
    delete: name => api.awards.deleteAward(name),
  },
})

const grantScenario = buildResourceScenario<Grant, GrantPage>({
  label: "grant",
  apiNamespace: {
    create: p => api.grants.createGrant(p),
    list: (page, perPage) => api.grants.listGrants(page, perPage),
    get: name => api.grants.getGrant(name),
    update: (name, data) => api.grants.updateGrant(name, data),
    delete: name => api.grants.deleteGrant(name),
  },
})

describe("api (auth)", () => {
  describe.each([
    {
      name: "register",
      method: () => mockPost,
      response: buildAuthSuccess("successfully registered"),
      execute: () => api.auth.register(TEST_EMAIL, TEST_PASSWORD),
      expectedArgs: ["/api/v1/auth/register", urlSearchParams],
    },
    {
      name: "login",
      method: () => mockPost,
      response: buildAuthSuccess("successfully logged in"),
      execute: () => api.auth.login(TEST_EMAIL, TEST_PASSWORD),
      expectedArgs: ["/api/v1/auth/login", urlSearchParams],
    },
    {
      name: "getUser",
      method: () => mockGet,
      response: {
        email: "test@example.com",
        admin: false,
        public_id: "123",
      } as UserInfo,
      execute: () => api.auth.getUser(),
      expectedArgs: ["/api/v1/auth/user"],
    },
    {
      name: "logout",
      method: () => mockPost,
      response: {
        status: "success",
        message: "successfully logged out",
      },
      execute: () => api.auth.logout(),
      expectedArgs: ["/api/v1/auth/logout"],
    },
  ])("auth.$name", ({ method, response, execute, expectedArgs }) => {
    it("should succeed", async () => {
      await expectDataRequest({
        method: method(),
        response,
        execute,
        expectedArgs,
      })
    })
  })
})

describeResourceApi(awardScenario)
describeResourceApi(grantScenario)

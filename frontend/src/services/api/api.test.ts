import { describe, it, expect, vi, beforeEach, afterAll } from "vitest"
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

const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

afterAll(() => {
  vi.unstubAllGlobals()
})

function jsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  } as Response
}

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
      mockFetch.mockResolvedValue(jsonResponse(response))

      const result = await scenario.create()
      expect(result).toEqual(response)

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(scenario.basePath)
      const init = mockFetch.mock.calls[0][1] as RequestInit
      expect(init.method).toBe("POST")
    })

    it(`should list ${scenario.resourceLabel}s`, async () => {
      mockFetch.mockResolvedValue(jsonResponse(scenario.listResponse))

      const result = await scenario.list()
      expect(result).toEqual(scenario.listResponse)

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(scenario.basePath)
      expect(url).toContain("page=1")
      expect(url).toContain("per_page=10")
    })

    it(`should get a single ${scenario.resourceLabel}`, async () => {
      const response = buildResource({ resource: scenario.resource })
      mockFetch.mockResolvedValue(jsonResponse(response))

      const result = await scenario.get()
      expect(result).toEqual(response)

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(`${scenario.basePath}/${scenario.resource.name}`)
    })

    it(`should update a ${scenario.resourceLabel}`, async () => {
      const response = buildResource({
        resource: scenario.resource,
        overrides: {
          deadline: UPDATED_RESOURCE_DEADLINE,
          time_remaining: UPDATED_RESOURCE_TIME_REMAINING,
        } as Partial<TResource>,
      })
      mockFetch.mockResolvedValue(jsonResponse(response))

      const result = await scenario.update()
      expect(result).toEqual(response)

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(`${scenario.basePath}/${scenario.resource.name}`)
      const init = mockFetch.mock.calls[0][1] as RequestInit
      expect(init.method).toBe("PUT")
    })

    it(`should delete a ${scenario.resourceLabel}`, async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 204 } as Response)

      await scenario.remove()

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(`${scenario.basePath}/${scenario.resource.name}`)
      const init = mockFetch.mock.calls[0][1] as RequestInit
      expect(init.method).toBe("DELETE")
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

function buildAuthSuccess(message: AuthSuccess["message"]): AuthSuccess {
  return {
    status: "success",
    message,
    token_type: "bearer",
    expires_in: 900,
  }
}

async function assertAuthCall<T>(
  response: T,
  call: () => Promise<T>,
  expectedPath: string,
) {
  mockFetch.mockResolvedValue(jsonResponse(response))
  const result = await call()
  expect(result).toEqual(response)
  const url = mockFetch.mock.calls[0][0] as string
  expect(url).toContain(expectedPath)
}

describe("api (auth)", () => {
  it("should register", async () => {
    const response = buildAuthSuccess("successfully registered")
    await assertAuthCall(
      response,
      () => api.auth.register(TEST_EMAIL, TEST_PASSWORD),
      "/api/v1/auth/register",
    )
    const init = mockFetch.mock.calls[0][1] as RequestInit
    expect(init.method).toBe("POST")
  })

  it("should login", async () => {
    await assertAuthCall(
      buildAuthSuccess("successfully logged in"),
      () => api.auth.login(TEST_EMAIL, TEST_PASSWORD),
      "/api/v1/auth/login",
    )
  })

  it("should getUser", async () => {
    const response: UserInfo = {
      email: "test@example.com",
      admin: false,
      public_id: "123",
    }
    await assertAuthCall(
      response,
      () => api.auth.getUser(),
      "/api/v1/auth/user",
    )
  })

  it("should logout", async () => {
    await assertAuthCall(
      { status: "success", message: "successfully logged out" },
      () => api.auth.logout(),
      "/api/v1/auth/logout",
    )
  })
})

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

describeResourceApi(awardScenario)
describeResourceApi(grantScenario)

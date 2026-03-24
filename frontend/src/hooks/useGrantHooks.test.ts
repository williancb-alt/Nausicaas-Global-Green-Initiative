import { renderHook, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  useGrants,
  useCreateGrant,
  useUpdateGrant,
  useDeleteGrant,
  useGrant,
} from "./useGrantHooks"
import { api } from "../services/api"
import { BaseResponse } from "../services/api/client"
import { EMPTY_PAGINATED_RESPONSE, mockGrant } from "../test/mock-data"
import { TestWrapper } from "../test/test-utils"

vi.mock("../services/api", () => ({
  api: {
    grants: {
      listGrants: vi.fn(),
      createGrant: vi.fn(),
      updateGrant: vi.fn(),
      deleteGrant: vi.fn(),
      getGrant: vi.fn(),
    },
  },
}))

vi.mock("../store/grantsStore", () => ({
  useGrantsStore: vi.fn(() => ({ currentPage: 1, itemsPerPage: 10 })),
}))

describe("useGrants", () => {
  beforeEach(() => vi.clearAllMocks())

  it("should fetch grants list", async () => {
    const mockPage = {
      ...EMPTY_PAGINATED_RESPONSE,
      items: [mockGrant],
      total_items: 1,
    }
    vi.mocked(api.grants.listGrants).mockResolvedValueOnce(mockPage as any)

    const { result } = renderHook(() => useGrants(), {
      wrapper: TestWrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockPage)
  })

  it("should handle error", async () => {
    vi.mocked(api.grants.listGrants).mockRejectedValueOnce(
      new Error("API Error"),
    )

    const { result } = renderHook(() => useGrants(), {
      wrapper: TestWrapper,
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe("useGrant", () => {
  beforeEach(() => vi.clearAllMocks())

  it("should fetch a single grant by name", async () => {
    vi.mocked(api.grants.getGrant).mockResolvedValueOnce(mockGrant)

    const { result } = renderHook(() => useGrant("Env Grant"), {
      wrapper: TestWrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockGrant)
  })

  it("should not fetch when name is empty", () => {
    const { result } = renderHook(() => useGrant(""), {
      wrapper: TestWrapper,
    })
    expect(result.current.fetchStatus).toBe("idle")
    expect(api.grants.getGrant).not.toHaveBeenCalled()
  })
})

describe.each([
  {
    name: "useCreateGrant",
    hook: useCreateGrant,
    mockFn: () => vi.mocked(api.grants.createGrant),
    mockResponse: { status: "success", message: "created" } as BaseResponse,
    mutateArg: {
      name: "Test Grant",
      deadline: "2026-12-31",
      description: "A grant",
    },
    checkData: true,
  },
  {
    name: "useUpdateGrant",
    hook: useUpdateGrant,
    mockFn: () => vi.mocked(api.grants.updateGrant),
    mockResponse: { status: "success", message: "updated" } as BaseResponse,
    mutateArg: { name: "Test Grant", deadline: "2027-01-01" },
    checkData: false,
  },
  {
    name: "useDeleteGrant",
    hook: useDeleteGrant,
    mockFn: () => vi.mocked(api.grants.deleteGrant),
    mockResponse: undefined as unknown as BaseResponse,
    mutateArg: "Test Grant",
    checkData: false,
  },
])("$name", ({ hook, mockFn, mockResponse, mutateArg, checkData }) => {
  beforeEach(() => vi.clearAllMocks())

  it("should succeed", async () => {
    mockFn().mockResolvedValueOnce(mockResponse as any)

    const { result } = renderHook(() => hook(), { wrapper: TestWrapper })
    result.current.mutate(mutateArg as any)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    if (checkData) {
      expect(result.current.data).toEqual(mockResponse)
    }
  })
})

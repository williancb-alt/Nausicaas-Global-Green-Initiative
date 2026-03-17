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

describe("useCreateGrant", () => {
  beforeEach(() => vi.clearAllMocks())

  it("should create a grant", async () => {
    const mockResponse: BaseResponse = { status: "success", message: "created" }
    vi.mocked(api.grants.createGrant).mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useCreateGrant(), {
      wrapper: TestWrapper,
    })
    result.current.mutate({
      name: "Test Grant",
      deadline: "2026-12-31",
      description: "A grant",
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockResponse)
  })
})

describe("useUpdateGrant", () => {
  beforeEach(() => vi.clearAllMocks())

  it("should update a grant", async () => {
    const mockResponse: BaseResponse = { status: "success", message: "updated" }
    vi.mocked(api.grants.updateGrant).mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useUpdateGrant(), {
      wrapper: TestWrapper,
    })
    result.current.mutate({ name: "Test Grant", deadline: "2027-01-01" })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe("useDeleteGrant", () => {
  beforeEach(() => vi.clearAllMocks())

  it("should delete a grant", async () => {
    vi.mocked(api.grants.deleteGrant).mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteGrant(), {
      wrapper: TestWrapper,
    })
    result.current.mutate("Test Grant")

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

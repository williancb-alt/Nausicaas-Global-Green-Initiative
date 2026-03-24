import { renderHook, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  useAwards,
  useCreateAward,
  useUpdateAward,
  useDeleteAward,
  useAward,
} from "./useAwardHooks"
import { api } from "../services/api"
import { BaseResponse } from "../services/api/client"
import { EMPTY_PAGINATED_RESPONSE, mockAward } from "../test/mock-data"
import { TestWrapper } from "../test/test-utils"

vi.mock("../services/api", () => ({
  api: {
    awards: {
      listAwards: vi.fn(),
      createAward: vi.fn(),
      updateAward: vi.fn(),
      deleteAward: vi.fn(),
      getAward: vi.fn(),
    },
  },
}))

vi.mock("../store/awardsStore", () => ({
  useAwardsStore: vi.fn(() => ({ currentPage: 1, itemsPerPage: 10 })),
}))

describe("useAwards", () => {
  beforeEach(() => vi.clearAllMocks())

  it("should fetch awards list", async () => {
    const mockPage = {
      ...EMPTY_PAGINATED_RESPONSE,
      items: [mockAward],
      total_items: 1,
    }
    vi.mocked(api.awards.listAwards).mockResolvedValueOnce(mockPage as any)

    const { result } = renderHook(() => useAwards(), {
      wrapper: TestWrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockPage)
  })

  it("should handle error", async () => {
    vi.mocked(api.awards.listAwards).mockRejectedValueOnce(
      new Error("API Error"),
    )

    const { result } = renderHook(() => useAwards(), {
      wrapper: TestWrapper,
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe("useAward", () => {
  beforeEach(() => vi.clearAllMocks())

  it("should fetch a single award by name", async () => {
    vi.mocked(api.awards.getAward).mockResolvedValueOnce(mockAward as any)

    const { result } = renderHook(() => useAward("Green Award"), {
      wrapper: TestWrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockAward)
  })

  it("should not fetch when name is empty", () => {
    const { result } = renderHook(() => useAward(""), {
      wrapper: TestWrapper,
    })
    expect(result.current.fetchStatus).toBe("idle")
    expect(api.awards.getAward).not.toHaveBeenCalled()
  })
})

describe.each([
  {
    name: "useCreateAward",
    hook: useCreateAward,
    mockFn: () => vi.mocked(api.awards.createAward),
    mockResponse: { status: "success", message: "created" } as BaseResponse,
    mutateArg: {
      name: "Green Award",
      deadline: "2026-12-31",
      description: "Test",
    },
    checkData: true,
  },
  {
    name: "useUpdateAward",
    hook: useUpdateAward,
    mockFn: () => vi.mocked(api.awards.updateAward),
    mockResponse: { status: "success", message: "updated" } as BaseResponse,
    mutateArg: { name: "Green Award", deadline: "2027-01-01" },
    checkData: false,
  },
  {
    name: "useDeleteAward",
    hook: useDeleteAward,
    mockFn: () => vi.mocked(api.awards.deleteAward),
    mockResponse: undefined as unknown as BaseResponse,
    mutateArg: "Green Award",
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

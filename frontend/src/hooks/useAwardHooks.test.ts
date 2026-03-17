import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { describe, it, expect, vi, beforeEach } from "vitest"
import React from "react"
import {
  useAwards,
  useCreateAward,
  useUpdateAward,
  useDeleteAward,
  useAward,
} from "./useAwardHooks"
import { api } from "../services/api"
import { Award, AwardPage, BaseResponse } from "../services/api/client"

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

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe("useAwards", () => {
  beforeEach(() => vi.clearAllMocks())

  it("should fetch awards list", async () => {
    const mockPage: AwardPage = {
      items: [
        {
          name: "Green Award",
          deadline: "2026-12-31",
          deadline_passed: false,
          time_remaining: "1 year",
        },
      ],
      total_items: 1,
      total_pages: 1,
      page: 1,
      has_next: false,
      has_prev: false,
      items_per_page: 10,
      links: { self: "", first: "", last: "" },
    }
    vi.mocked(api.awards.listAwards).mockResolvedValueOnce(mockPage)

    const { result } = renderHook(() => useAwards(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockPage)
  })

  it("should handle error", async () => {
    vi.mocked(api.awards.listAwards).mockRejectedValueOnce(
      new Error("API Error"),
    )

    const { result } = renderHook(() => useAwards(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe("useAward", () => {
  beforeEach(() => vi.clearAllMocks())

  it("should fetch a single award by name", async () => {
    const mockAward: Award = {
      name: "Green Award",
      deadline: "2026-12-31",
      deadline_passed: false,
      time_remaining: "1 year",
    }
    vi.mocked(api.awards.getAward).mockResolvedValueOnce(mockAward)

    const { result } = renderHook(() => useAward("Green Award"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockAward)
  })

  it("should not fetch when name is empty", () => {
    const { result } = renderHook(() => useAward(""), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe("idle")
    expect(api.awards.getAward).not.toHaveBeenCalled()
  })
})

describe("useCreateAward", () => {
  beforeEach(() => vi.clearAllMocks())

  it("should create an award", async () => {
    const mockResponse: BaseResponse = { status: "success", message: "created" }
    vi.mocked(api.awards.createAward).mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useCreateAward(), {
      wrapper: createWrapper(),
    })
    result.current.mutate({
      name: "Green Award",
      deadline: "2026-12-31",
      description: "Test",
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockResponse)
  })
})

describe("useUpdateAward", () => {
  beforeEach(() => vi.clearAllMocks())

  it("should update an award", async () => {
    const mockResponse: BaseResponse = { status: "success", message: "updated" }
    vi.mocked(api.awards.updateAward).mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useUpdateAward(), {
      wrapper: createWrapper(),
    })
    result.current.mutate({ name: "Green Award", deadline: "2027-01-01" })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe("useDeleteAward", () => {
  beforeEach(() => vi.clearAllMocks())

  it("should delete an award", async () => {
    vi.mocked(api.awards.deleteAward).mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteAward(), {
      wrapper: createWrapper(),
    })
    result.current.mutate("Green Award")

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { describe, it, expect, vi, beforeEach } from "vitest"
import React from "react"
import {
  useMyApplications,
  useApplications,
  useApplication,
  useSubmitApplication,
  useDeleteApplication,
} from "./useApplicationHooks"
import { api } from "../services/api"
import { ApplicationsResponse } from "../services/api/applications"
import { Application } from "../types"

vi.mock("../services/api", () => ({
  api: {
    applications: {
      getMyApplications: vi.fn(),
      getAllApplications: vi.fn(),
      getApplication: vi.fn(),
      submitApplication: vi.fn(),
      deleteApplication: vi.fn(),
      updateApplication: vi.fn(),
    },
  },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe("useMyApplications", () => {
  beforeEach(() => vi.clearAllMocks())

  it("should fetch current user applications", async () => {
    const mockData: ApplicationsResponse = {
      items: [{ id: 1, status: "approved" } as any],
      total_items: 1,
      total_pages: 1,
      page: 1,
      has_next: false,
      has_prev: false,
    }
    vi.mocked(api.applications.getMyApplications).mockResolvedValueOnce(
      mockData,
    )

    const { result } = renderHook(() => useMyApplications(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockData)
  })

  it("should handle error state", async () => {
    vi.mocked(api.applications.getMyApplications).mockRejectedValueOnce(
      new Error("Server error"),
    )

    const { result } = renderHook(() => useMyApplications(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe("useApplications", () => {
  beforeEach(() => vi.clearAllMocks())

  it("should fetch all applications", async () => {
    const mockData: ApplicationsResponse = {
      items: [],
      total_items: 0,
      total_pages: 0,
      page: 1,
      has_next: false,
      has_prev: false,
    }
    vi.mocked(api.applications.getAllApplications).mockResolvedValueOnce(
      mockData,
    )

    const { result } = renderHook(() => useApplications(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockData)
  })
})

describe("useApplication", () => {
  beforeEach(() => vi.clearAllMocks())

  it("should fetch single application by ID", async () => {
    const mockApp = { id: 42, status: "pending_review" } as Application
    vi.mocked(api.applications.getApplication).mockResolvedValueOnce(mockApp)

    const { result } = renderHook(() => useApplication("42"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockApp)
  })

  it("should not fetch when id is undefined", () => {
    const { result } = renderHook(() => useApplication(undefined), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe("idle")
    expect(api.applications.getApplication).not.toHaveBeenCalled()
  })
})

describe("useSubmitApplication", () => {
  beforeEach(() => vi.clearAllMocks())

  it("should submit application successfully", async () => {
    const mockResponse = {
      status: "success",
      message: "submitted",
      application_id: 1,
    }
    vi.mocked(api.applications.submitApplication).mockResolvedValueOnce(
      mockResponse,
    )

    const { result } = renderHook(() => useSubmitApplication(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ grantName: "Test Grant", fieldValues: {} })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockResponse)
  })
})

describe("useDeleteApplication", () => {
  beforeEach(() => vi.clearAllMocks())

  it("should delete application", async () => {
    vi.mocked(api.applications.deleteApplication).mockResolvedValueOnce(
      undefined,
    )

    const { result } = renderHook(() => useDeleteApplication(), {
      wrapper: createWrapper(),
    })

    result.current.mutate("42")

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

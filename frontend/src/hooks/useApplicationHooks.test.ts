import { renderHook, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  useMyApplications,
  useApplications,
  useApplication,
  useSubmitApplication,
  useDeleteApplication,
} from "./useApplicationHooks"
import { api } from "../services/api"
import { Application } from "../types"
import { EMPTY_PAGINATED_RESPONSE } from "../test/mock-data"
import { TestWrapper } from "../test/test-utils"

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

describe("useMyApplications", () => {
  beforeEach(() => vi.clearAllMocks())

  it("should fetch current user applications", async () => {
    const mockData = {
      ...EMPTY_PAGINATED_RESPONSE,
      items: [{ id: 1, status: "approved" } as any],
      total_items: 1,
    }
    vi.mocked(api.applications.getMyApplications).mockResolvedValueOnce(
      mockData,
    )

    const { result } = renderHook(() => useMyApplications(), {
      wrapper: TestWrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockData)
  })

  it("should handle error state", async () => {
    vi.mocked(api.applications.getMyApplications).mockRejectedValueOnce(
      new Error("Server error"),
    )

    const { result } = renderHook(() => useMyApplications(), {
      wrapper: TestWrapper,
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe("useApplications", () => {
  beforeEach(() => vi.clearAllMocks())

  it("should fetch all applications", async () => {
    vi.mocked(api.applications.getAllApplications).mockResolvedValueOnce(
      EMPTY_PAGINATED_RESPONSE,
    )

    const { result } = renderHook(() => useApplications(), {
      wrapper: TestWrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(EMPTY_PAGINATED_RESPONSE)
  })
})

describe("useApplication", () => {
  beforeEach(() => vi.clearAllMocks())

  it("should fetch single application by ID", async () => {
    const mockApp = { id: 42, status: "pending_review" } as Application
    vi.mocked(api.applications.getApplication).mockResolvedValueOnce(mockApp)

    const { result } = renderHook(() => useApplication("42"), {
      wrapper: TestWrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockApp)
  })

  it("should not fetch when id is undefined", () => {
    const { result } = renderHook(() => useApplication(undefined), {
      wrapper: TestWrapper,
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
      wrapper: TestWrapper,
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
      wrapper: TestWrapper,
    })

    result.current.mutate("42")

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

import { describe, it, expect, vi, beforeEach } from "vitest"
import { grantsApi } from "./grants"
import { apiClient, BaseResponse, Grant } from "./client"
import { EMPTY_PAGINATED_RESPONSE } from "../../test/mock-data"

const mockedPost = vi.spyOn(apiClient, "post")
const mockedGet = vi.spyOn(apiClient, "get")
const mockedPut = vi.spyOn(apiClient, "put")
const mockedDelete = vi.spyOn(apiClient, "delete")

const createSuccessResponse = (message: string): BaseResponse => ({
  status: "success",
  message,
})

describe("grantsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should call createGrant and return data", async () => {
    const mockResponse = createSuccessResponse("created")
    mockedPost.mockResolvedValueOnce({ data: mockResponse })

    const result = await grantsApi.createGrant({
      name: "Test Grant",
      deadline: "2026-12-31",
      description: "A test grant",
    })
    expect(result).toEqual(mockResponse)
    expect(mockedPost).toHaveBeenCalledWith(
      "/api/v1/grants",
      expect.any(URLSearchParams),
    )
  })

  it("should call listGrants and return page data", async () => {
    mockedGet.mockResolvedValueOnce({ data: EMPTY_PAGINATED_RESPONSE })

    const result = await grantsApi.listGrants(1, 10)
    expect(result).toEqual(EMPTY_PAGINATED_RESPONSE)
    expect(mockedGet).toHaveBeenCalledWith("/api/v1/grants", {
      params: { page: 1, per_page: 10 },
    })
  })

  it("should call getGrant with encoded name", async () => {
    const mockGrant: Grant = {
      name: "Test Grant",
      deadline: "2026-12-31",
      deadline_passed: false,
      time_remaining: "1 year",
    }
    mockedGet.mockResolvedValueOnce({ data: mockGrant })

    const result = await grantsApi.getGrant("Test Grant")
    expect(result).toEqual(mockGrant)
    expect(mockedGet).toHaveBeenCalledWith("/api/v1/grants/Test%20Grant")
  })

  it("should call updateGrant", async () => {
    const mockResponse: BaseResponse = { status: "success", message: "updated" }
    mockedPut.mockResolvedValueOnce({ data: mockResponse })

    const result = await grantsApi.updateGrant("Test Grant", {
      deadline: "2027-01-01",
    })
    expect(result).toEqual(mockResponse)
    expect(mockedPut).toHaveBeenCalledWith(
      "/api/v1/grants/Test%20Grant",
      expect.any(URLSearchParams),
    )
  })

  it("should call deleteGrant", async () => {
    mockedDelete.mockResolvedValueOnce(undefined as any)

    await grantsApi.deleteGrant("Test Grant")
    expect(mockedDelete).toHaveBeenCalledWith("/api/v1/grants/Test%20Grant")
  })
})

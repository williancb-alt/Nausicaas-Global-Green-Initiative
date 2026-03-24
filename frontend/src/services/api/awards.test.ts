import { describe, it, expect, vi, beforeEach } from "vitest"
import { awardsApi } from "./awards"
import { apiClient, BaseResponse, Award } from "./client"
import { EMPTY_PAGINATED_RESPONSE } from "../../test/mock-data"

const mockedGet = vi.spyOn(apiClient, "get")
const mockedPost = vi.spyOn(apiClient, "post")
const mockedPut = vi.spyOn(apiClient, "put")
const mockedDelete = vi.spyOn(apiClient, "delete")

const createSuccessResponse = (message: string): BaseResponse => ({
  status: "success",
  message,
})

describe("awardsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should call createAward and return data", async () => {
    const mockResponse = createSuccessResponse("created")
    mockedPost.mockResolvedValueOnce({ data: mockResponse })

    const result = await awardsApi.createAward({
      name: "Green Award",
      deadline: "2026-12-31",
      description: "An award for green initiatives",
    })
    expect(result).toEqual(mockResponse)
    expect(mockedPost).toHaveBeenCalledWith(
      "/api/v1/awards",
      expect.any(URLSearchParams),
    )
  })

  it("should call listAwards and return page data", async () => {
    mockedGet.mockResolvedValueOnce({ data: EMPTY_PAGINATED_RESPONSE })

    const result = await awardsApi.listAwards(1, 10)
    expect(result).toEqual(EMPTY_PAGINATED_RESPONSE)
    expect(mockedGet).toHaveBeenCalledWith("/api/v1/awards", {
      params: { page: 1, per_page: 10 },
    })
  })

  it("should call getAward with encoded name", async () => {
    const mockAward: Award = {
      name: "Green Award",
      deadline: "2026-12-31",
      deadline_passed: false,
      time_remaining: "1 year",
    }
    mockedGet.mockResolvedValueOnce({ data: mockAward })

    const result = await awardsApi.getAward("Green Award")
    expect(result).toEqual(mockAward)
    expect(mockedGet).toHaveBeenCalledWith("/api/v1/awards/Green%20Award")
  })

  it("should call updateAward with only provided fields", async () => {
    const mockResponse: BaseResponse = { status: "success", message: "updated" }
    mockedPut.mockResolvedValueOnce({ data: mockResponse })

    const result = await awardsApi.updateAward("Green Award", {
      deadline: "2027-01-01",
    })
    expect(result).toEqual(mockResponse)
    expect(mockedPut).toHaveBeenCalledWith(
      "/api/v1/awards/Green%20Award",
      expect.any(URLSearchParams),
    )
  })

  it("should call deleteAward", async () => {
    mockedDelete.mockResolvedValueOnce({ data: undefined })

    await awardsApi.deleteAward("Green Award")
    expect(mockedDelete).toHaveBeenCalledWith("/api/v1/awards/Green%20Award")
  })
})

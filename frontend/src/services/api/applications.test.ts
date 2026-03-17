import { describe, it, expect, vi, beforeEach } from "vitest"
import { applications } from "./applications"
import { apiClient } from "./client"
import { Application } from "../../types"
import { EMPTY_PAGINATED_RESPONSE } from "../../test/mock-data"

const mockedGet = vi.spyOn(apiClient, "get")
const mockedPost = vi.spyOn(apiClient, "post")
const mockedPut = vi.spyOn(apiClient, "put")
const mockedDelete = vi.spyOn(apiClient, "delete")

describe("applicationsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should call getMyApplications endpoint", async () => {
    mockedGet.mockResolvedValueOnce({ data: EMPTY_PAGINATED_RESPONSE })

    const result = await applications.getMyApplications()
    expect(result).toEqual(EMPTY_PAGINATED_RESPONSE)
    expect(mockedGet).toHaveBeenCalledWith(
      "/api/v1/applications/me?page=1&per_page=10",
    )
  })

  it("should call getAllApplications endpoint", async () => {
    mockedGet.mockResolvedValueOnce({ data: EMPTY_PAGINATED_RESPONSE })

    const result = await applications.getAllApplications()
    expect(result).toEqual(EMPTY_PAGINATED_RESPONSE)
    expect(mockedGet).toHaveBeenCalledWith(
      "/api/v1/applications?page=1&per_page=10",
    )
  })

  it("should call getApplication by ID", async () => {
    const mockApp: Partial<Application> = { id: 42, status: "approved" }
    mockedGet.mockResolvedValueOnce({ data: mockApp })

    const result = await applications.getApplication("42")
    expect(result).toEqual(mockApp)
    expect(mockedGet).toHaveBeenCalledWith("/api/v1/applications/42")
  })

  it("should call submitApplication", async () => {
    const mockResponse = {
      status: "success",
      message: "submitted",
      application_id: 5,
    }
    mockedPost.mockResolvedValueOnce({ data: mockResponse })

    const result = await applications.submitApplication("Test Grant", {
      field1: "value1",
    })
    expect(result).toEqual(mockResponse)
    expect(mockedPost).toHaveBeenCalledWith(
      "/api/v1/applications",
      { grant_name: "Test Grant", field_values: { field1: "value1" } },
      expect.any(Object),
    )
  })

  it("should call updateApplication", async () => {
    const mockResponse = { status: "success", message: "updated" }
    mockedPut.mockResolvedValueOnce({ data: mockResponse })

    const result = await applications.updateApplication("42", {
      status: "approved",
    })
    expect(result).toEqual(mockResponse)
    expect(mockedPut).toHaveBeenCalledWith(
      "/api/v1/applications/42",
      { status: "approved" },
      expect.any(Object),
    )
  })

  it("should call deleteApplication", async () => {
    mockedDelete.mockResolvedValueOnce({ data: undefined })

    await applications.deleteApplication("42")
    expect(mockedDelete).toHaveBeenCalledWith("/api/v1/applications/42")
  })
})

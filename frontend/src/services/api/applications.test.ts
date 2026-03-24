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

  it.each([
    {
      name: "getMyApplications",
      mock: () => mockedGet,
      response: EMPTY_PAGINATED_RESPONSE,
      execute: () => applications.getMyApplications(),
      expectedArgs: ["/api/v1/applications/me?page=1&per_page=10"],
    },
    {
      name: "getAllApplications",
      mock: () => mockedGet,
      response: EMPTY_PAGINATED_RESPONSE,
      execute: () => applications.getAllApplications(),
      expectedArgs: ["/api/v1/applications?page=1&per_page=10"],
    },
    {
      name: "getApplication by ID",
      mock: () => mockedGet,
      response: { id: 42, status: "approved" } as Partial<Application>,
      execute: () => applications.getApplication("42"),
      expectedArgs: ["/api/v1/applications/42"],
    },
    {
      name: "submitApplication",
      mock: () => mockedPost,
      response: { status: "success", message: "submitted", application_id: 5 },
      execute: () =>
        applications.submitApplication("Test Grant", { field1: "value1" }),
      expectedArgs: [
        "/api/v1/applications",
        { grant_name: "Test Grant", field_values: { field1: "value1" } },
        expect.any(Object),
      ],
    },
    {
      name: "updateApplication",
      mock: () => mockedPut,
      response: { status: "success", message: "updated" },
      execute: () =>
        applications.updateApplication("42", { status: "approved" }),
      expectedArgs: [
        "/api/v1/applications/42",
        { status: "approved" },
        expect.any(Object),
      ],
    },
    {
      name: "deleteApplication",
      mock: () => mockedDelete,
      response: undefined,
      execute: () => applications.deleteApplication("42"),
      expectedArgs: ["/api/v1/applications/42"],
    },
  ])("should call $name", async ({ mock, response, execute, expectedArgs }) => {
    mock().mockResolvedValueOnce({ data: response })

    const result = await execute()
    if (response !== undefined) {
      expect(result).toEqual(response)
    }
    expect(mock()).toHaveBeenCalledWith(...expectedArgs)
  })
})

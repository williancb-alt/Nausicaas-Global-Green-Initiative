import { describe, it, expect, vi, beforeEach } from "vitest"
import { applications } from "./applications"
import { apiClient } from "./client"

vi.mock("./client", async importOriginal => {
    const actual = await importOriginal<typeof import("./client")>()
    return {
        ...actual,
        apiClient: {
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
        },
    }
})

const mockedGet = vi.mocked(apiClient.get)
const mockedPost = vi.mocked(apiClient.post)
const mockedPut = vi.mocked(apiClient.put)
const mockedDelete = vi.mocked(apiClient.delete)

describe("applicationsApi", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("should call getMyApplications endpoint", async () => {
        const mockData = { items: [], has_next: false, has_prev: false, page: 1, total_pages: 1, total_items: 0 }
        mockedGet.mockResolvedValueOnce({ data: mockData } as any)

        const result = await applications.getMyApplications()
        expect(result).toEqual(mockData)
        expect(mockedGet).toHaveBeenCalledWith("/api/v1/applications/me?page=1&per_page=10")
    })

    it("should call getAllApplications endpoint", async () => {
        const mockData = { items: [], has_next: false, has_prev: false, page: 1, total_pages: 1, total_items: 0 }
        mockedGet.mockResolvedValueOnce({ data: mockData } as any)

        const result = await applications.getAllApplications()
        expect(result).toEqual(mockData)
        expect(mockedGet).toHaveBeenCalledWith("/api/v1/applications?page=1&per_page=10")
    })

    it("should call getApplication by ID", async () => {
        const mockApp = { id: 42, status: "approved" }
        mockedGet.mockResolvedValueOnce({ data: mockApp } as any)

        const result = await applications.getApplication("42")
        expect(result).toEqual(mockApp)
        expect(mockedGet).toHaveBeenCalledWith("/api/v1/applications/42")
    })

    it("should call submitApplication", async () => {
        const mockResponse = { status: "success", message: "submitted", application_id: 5 }
        mockedPost.mockResolvedValueOnce({ data: mockResponse } as any)

        const result = await applications.submitApplication("Test Grant", { field1: "value1" })
        expect(result).toEqual(mockResponse)
        expect(mockedPost).toHaveBeenCalledWith(
            "/api/v1/applications",
            { grant_name: "Test Grant", field_values: { field1: "value1" } },
            expect.any(Object),
        )
    })

    it("should call updateApplication", async () => {
        const mockResponse = { status: "success", message: "updated" }
        mockedPut.mockResolvedValueOnce({ data: mockResponse } as any)

        const result = await applications.updateApplication("42", { status: "approved" })
        expect(result).toEqual(mockResponse)
        expect(mockedPut).toHaveBeenCalledWith(
            "/api/v1/applications/42",
            { status: "approved" },
            expect.any(Object),
        )
    })

    it("should call deleteApplication", async () => {
        mockedDelete.mockResolvedValueOnce({ data: undefined } as any)

        await applications.deleteApplication("42")
        expect(mockedDelete).toHaveBeenCalledWith("/api/v1/applications/42")
    })
})

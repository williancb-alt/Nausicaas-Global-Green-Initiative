import { describe, it, expect, vi, beforeEach } from "vitest"
import { grantsApi } from "./grants"
import { apiClient, BaseResponse, Grant, GrantPage } from "./client"

vi.mock("./client", async importOriginal => {
    const actual = await importOriginal<typeof import("./client")>()
    return {
        ...actual,
        apiClient: {
            post: vi.fn(),
            get: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
        },
    }
})

const mockedPost = vi.mocked(apiClient.post)
const mockedGet = vi.mocked(apiClient.get)
const mockedPut = vi.mocked(apiClient.put)
const mockedDelete = vi.mocked(apiClient.delete)

describe("grantsApi", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("should call createGrant and return data", async () => {
        const mockResponse: BaseResponse = { status: "success", message: "created" }
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
        const mockPage: GrantPage = {
            items: [],
            links: { self: "", first: "", last: "" },
            has_next: false,
            has_prev: false,
            page: 1,
            total_pages: 1,
            total_items: 0,
            items_per_page: 10
        }
        mockedGet.mockResolvedValueOnce({ data: mockPage })

        const result = await grantsApi.listGrants(1, 10)
        expect(result).toEqual(mockPage)
        expect(mockedGet).toHaveBeenCalledWith("/api/v1/grants", {
            params: { page: 1, per_page: 10 },
        })
    })

    it("should call getGrant with encoded name", async () => {
        const mockGrant: Grant = {
            name: "Test Grant",
            deadline: "2026-12-31",
            deadline_passed: false,
            time_remaining: "1 year"
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
        mockedDelete.mockResolvedValueOnce({ data: undefined })

        await grantsApi.deleteGrant("Test Grant")
        expect(mockedDelete).toHaveBeenCalledWith("/api/v1/grants/Test%20Grant")
    })
})

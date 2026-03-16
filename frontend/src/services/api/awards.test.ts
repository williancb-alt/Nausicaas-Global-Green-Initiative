import { describe, it, expect, vi, beforeEach } from "vitest"
import { awardsApi } from "./awards"
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

describe("awardsApi", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("should call createAward and return data", async () => {
        const mockResponse = { status: "success", message: "created" }
        mockedPost.mockResolvedValueOnce({ data: mockResponse } as any)

        const result = await awardsApi.createAward({
            name: "Green Award",
            deadline: "2026-12-31",
            description: "An award for green initiatives",
        })
        expect(result).toEqual(mockResponse)
        expect(mockedPost).toHaveBeenCalledWith("/api/v1/awards", expect.any(URLSearchParams))
    })

    it("should call listAwards and return page data", async () => {
        const mockPage = { items: [], links: {}, meta: {} }
        mockedGet.mockResolvedValueOnce({ data: mockPage } as any)

        const result = await awardsApi.listAwards(1, 10)
        expect(result).toEqual(mockPage)
        expect(mockedGet).toHaveBeenCalledWith("/api/v1/awards", { params: { page: 1, per_page: 10 } })
    })

    it("should call getAward with encoded name", async () => {
        const mockAward = { name: "Green Award", deadline: "2026-12-31" }
        mockedGet.mockResolvedValueOnce({ data: mockAward } as any)

        const result = await awardsApi.getAward("Green Award")
        expect(result).toEqual(mockAward)
        expect(mockedGet).toHaveBeenCalledWith("/api/v1/awards/Green%20Award")
    })

    it("should call updateAward with only provided fields", async () => {
        const mockResponse = { status: "success", message: "updated" }
        mockedPut.mockResolvedValueOnce({ data: mockResponse } as any)

        const result = await awardsApi.updateAward("Green Award", { deadline: "2027-01-01" })
        expect(result).toEqual(mockResponse)
        expect(mockedPut).toHaveBeenCalledWith("/api/v1/awards/Green%20Award", expect.any(URLSearchParams))
    })

    it("should call deleteAward", async () => {
        mockedDelete.mockResolvedValueOnce({ data: undefined } as any)

        await awardsApi.deleteAward("Green Award")
        expect(mockedDelete).toHaveBeenCalledWith("/api/v1/awards/Green%20Award")
    })
})

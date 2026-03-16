import { describe, it, expect, vi, beforeEach } from "vitest"
import { auditApi } from "./audit"
import { apiClient } from "./client"

vi.mock("./client", () => ({
    apiClient: {
        get: vi.fn()
    }
}))

describe("auditApi", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("should get recent logs", async () => {
        const mockData = {
            status: "success",
            count: 1,
            items: [{ id: 1, action: "test" }]
        }
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockData })

        const result = await auditApi.getRecentLogs(10)

        expect(apiClient.get).toHaveBeenCalledWith("/api/v1/audit", { params: { limit: 10 } })
        expect(result.logs).toEqual(mockData.items)
    })

    it("should get failed logs", async () => {
        const mockData = {
            status: "success",
            count: 0,
            items: []
        }
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockData })

        const result = await auditApi.getFailedLogs()

        expect(apiClient.get).toHaveBeenCalledWith("/api/v1/audit/failed", { params: { limit: 100 } })
        expect(result.logs).toEqual([])
    })

    it("should get entity logs", async () => {
        const mockData = {
            status: "success",
            count: 1,
            items: [{ id: 2 }]
        }
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockData })

        const result = await auditApi.getEntityLogs("grant", 123)

        expect(apiClient.get).toHaveBeenCalledWith("/api/v1/audit/entity/grant/123", { params: { limit: 100 } })
        expect(result.logs).toEqual(mockData.items)
    })
})

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
        const mockBackendData = {
            status: "success",
            count: 1,
            items: [{
                id: 1,
                action: "test",
                timestamp: "2026-01-01T00:00:00Z",
                user_email: "test@user.com",
                is_admin: true,
                entity_type: "grant",
                entity_id: 1,
                details: "{}",
                ip_address: "127.0.0.1",
                user_agent: "test",
                success: true,
                failure_reason: null
            }]
        }
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockBackendData })

        const result = await auditApi.getRecentLogs(10)

        expect(apiClient.get).toHaveBeenCalledWith("/api/v1/audit", { params: { limit: 10 } })
        expect(result.logs).toEqual(mockBackendData.items)
    })

    it("should get failed logs", async () => {
        const mockBackendData = {
            status: "success",
            count: 0,
            items: []
        }
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockBackendData })

        const result = await auditApi.getFailedLogs()

        expect(apiClient.get).toHaveBeenCalledWith("/api/v1/audit/failed", { params: { limit: 100 } })
        expect(result.logs).toEqual([])
    })

    it("should get entity logs", async () => {
        const mockBackendData = {
            status: "success",
            count: 1,
            items: [{
                id: 2,
                action: "update",
                timestamp: "2026-01-01T00:00:00Z",
                user_email: "test@user.com",
                is_admin: true,
                entity_type: "grant",
                entity_id: 123,
                details: "{}",
                ip_address: "127.0.0.1",
                user_agent: "test",
                success: true,
                failure_reason: null
            }]
        }
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockBackendData })

        const result = await auditApi.getEntityLogs("grant", 123)

        expect(apiClient.get).toHaveBeenCalledWith("/api/v1/audit/entity/grant/123", { params: { limit: 100 } })
        expect(result.logs).toEqual(mockBackendData.items)
    })
})

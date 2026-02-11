import { apiClient } from "./client"

export interface AuditLog {
  id: number
  timestamp: string
  user_email: string | null
  is_admin: boolean
  action: string
  entity_type: string
  entity_id: number | null
  details: string | null
  ip_address: string | null
  user_agent: string | null
  success: boolean
  failure_reason: string | null
}

export interface AuditLogsResponse {
  logs: AuditLog[]
  count: number
}

export const auditApi = {
  /**
   * Get recent audit logs (admin only)
   */
  getRecentLogs: async (limit = 100): Promise<AuditLogsResponse> => {
    const { data } = await apiClient.get<AuditLogsResponse>("/api/v1/audit", {
      params: { limit },
    })
    return data
  },

  /**
   * Get failed audit attempts (admin only)
   */
  getFailedLogs: async (limit = 100): Promise<AuditLogsResponse> => {
    const { data } = await apiClient.get<AuditLogsResponse>(
      "/api/v1/audit/failed",
      {
        params: { limit },
      },
    )
    return data
  },

  /**
   * Get audit logs for a specific entity (admin only)
   */
  getEntityLogs: async (
    entityType: string,
    entityId: number,
    limit = 100,
  ): Promise<AuditLogsResponse> => {
    const { data } = await apiClient.get<AuditLogsResponse>(
      `/api/v1/audit/entity/${entityType}/${entityId}`,
      {
        params: { limit },
      },
    )
    return data
  },
}

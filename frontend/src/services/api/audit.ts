import { apiClient } from "./client"

export interface AuditLog {
  id: number
  timestamp: string
  user_id?: number | null
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
  status: string
  count: number
  logs: AuditLog[] // We'll map 'items' to 'logs' for consistency in frontend
}

interface BackendAuditResponse {
  status: string
  count: number
  items: AuditLog[]
}

export const auditApi = {
  /**
   * Get recent audit logs (admin only)
   */
  getRecentLogs: async (limit = 100): Promise<AuditLogsResponse> => {
    const { data } = await apiClient.get<BackendAuditResponse>("/api/v1/audit", {
      params: { limit },
    })
    return {
      status: data.status,
      count: data.count,
      logs: data.items, // Map 'items' to 'logs'
    }
  },

  /**
   * Get failed audit attempts (admin only)
   */
  getFailedLogs: async (limit = 100): Promise<AuditLogsResponse> => {
    const { data } = await apiClient.get<BackendAuditResponse>(
      "/api/v1/audit/failed",
      {
        params: { limit },
      },
    )
    return {
      status: data.status,
      count: data.count,
      logs: data.items, // Map 'items' to 'logs'
    }
  },

  /**
   * Get audit logs for a specific entity (admin only)
   */
  getEntityLogs: async (
    entityType: string,
    entityId: number,
    limit = 100,
  ): Promise<AuditLogsResponse> => {
    const { data } = await apiClient.get<BackendAuditResponse>(
      `/api/v1/audit/entity/${entityType}/${entityId}`,
      {
        params: { limit },
      },
    )
    return {
      status: data.status,
      count: data.count,
      logs: data.items, // Map 'items' to 'logs'
    }
  },
}
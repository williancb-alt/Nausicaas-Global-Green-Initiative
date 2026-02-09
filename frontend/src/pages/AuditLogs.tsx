import { JSX, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "../services/api"
import { Button } from "../components/button/Button"
import { AlertError } from "../components/alert/AlertError"

type FilterType = "all" | "failed" | "entity"

export function AuditLogs(): JSX.Element {
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [entityType, setEntityType] = useState("grant")
  const [entityId, setEntityId] = useState("")
  const [limit, setLimit] = useState(100)

  const {
    data: auditData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["audit", filterType, entityType, entityId, limit],
    queryFn: async () => {
      if (filterType === "failed") {
        return api.audit.getFailedLogs(limit)
      }
      if (filterType === "entity" && entityId) {
        return api.audit.getEntityLogs(entityType, parseInt(entityId), limit)
      }
      return api.audit.getRecentLogs(limit)
    },
    enabled: filterType !== "entity" || !!entityId,
  })

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString()
  }

  const formatDetails = (details: string | null): string => {
    if (!details) return "N/A"
    try {
      const parsed: unknown = JSON.parse(details)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return details
    }
  }

  const getActionBadgeColor = (action: string): string => {
    if (action.includes("created")) return "bg-success"
    if (action.includes("edited")) return "bg-warning"
    if (action.includes("deleted")) return "bg-danger"
    if (action.includes("blocked")) return "bg-danger"
    return "bg-secondary"
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">Audit Logs</h1>
        <Button onClick={() => void refetch()} disabled={isLoading}>
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Filters</h5>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Filter Type</label>
              <select
                className="form-select"
                value={filterType}
                onChange={e => setFilterType(e.target.value as FilterType)}
              >
                <option value="all">All Logs</option>
                <option value="failed">Failed Attempts Only</option>
                <option value="entity">Specific Entity</option>
              </select>
            </div>

            {filterType === "entity" && (
              <>
                <div className="col-md-3">
                  <label className="form-label">Entity Type</label>
                  <select
                    className="form-select"
                    value={entityType}
                    onChange={e => setEntityType(e.target.value)}
                  >
                    <option value="grant">Grant</option>
                    <option value="application">Application</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Entity ID</label>
                  <input
                    type="number"
                    className="form-control"
                    value={entityId}
                    onChange={e => setEntityId(e.target.value)}
                    placeholder="Enter entity ID"
                  />
                </div>
              </>
            )}

            <div className="col-md-3">
              <label className="form-label">Limit</label>
              <select
                className="form-select"
                value={limit}
                onChange={e => setLimit(parseInt(e.target.value))}
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {isError && (
        <AlertError error={error} fallback="Failed to load audit logs" />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Audit Logs Table */}
      {!isLoading && auditData && (
        <>
          <div className="alert alert-info">
            Showing {auditData.logs.length} of {auditData.count} total logs
          </div>

          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditData.logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  auditData.logs.map(log => (
                    <tr key={log.id}>
                      <td className="small">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td>
                        <div>
                          {log.user_email || "System"}
                          {log.is_admin && (
                            <span className="badge bg-primary ms-2">Admin</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${getActionBadgeColor(log.action)}`}
                        >
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td>
                        {log.entity_type} #{log.entity_id}
                      </td>
                      <td>
                        {log.success ? (
                          <span className="badge bg-success">Success</span>
                        ) : (
                          <span className="badge bg-danger">Failed</span>
                        )}
                        {log.failure_reason && (
                          <div className="small text-danger mt-1">
                            {log.failure_reason}
                          </div>
                        )}
                      </td>
                      <td>
                        {log.details && (
                          <details>
                            <summary className="btn btn-sm btn-outline-secondary">
                              View
                            </summary>
                            <pre className="mt-2 p-2 bg-light border rounded small">
                              {formatDetails(log.details)}
                            </pre>
                          </details>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

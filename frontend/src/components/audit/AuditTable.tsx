import { JSX } from "react"
import type { AuditLog } from "../../services/api/audit"

// Helper to parse details JSON string
interface AuditDetails {
  grant_name?: string
  [key: string]: unknown
}

function parseDetails(details: string | null): AuditDetails | null {
  if (!details) return null
  try {
    return JSON.parse(details) as AuditDetails
  } catch {
    return null
  }
}

interface AuditTableProps {
  logs: AuditLog[]
  onRowClick: (log: AuditLog) => void
}

export function AuditTable({ logs, onRowClick }: AuditTableProps): JSX.Element {
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getActionBadge = (action: string): JSX.Element => {
    const badges: Record<string, { color: string; label: string }> = {
      grant_created: { color: "success", label: "Created" },
      grant_edited: { color: "warning", label: "Edited" },
      grant_deleted: { color: "danger", label: "Deleted" },
      application_submitted: { color: "info", label: "Submitted" },
      application_edit_blocked: { color: "danger", label: "Blocked" },
      unauthorized_access: { color: "danger", label: "Unauthorized" },
    }

    const badge = badges[action] || { color: "secondary", label: action }

    return (
      <span className={`badge bg-${badge.color}`}>{badge.label}</span>
    )
  }

  const getStatusIcon = (log: AuditLog): string => {
    if (!log.success) return "🚨"
    if (log.action.includes("blocked") || log.action.includes("unauthorized"))
      return "⛔"
    if (log.action.includes("deleted")) return "🗑️"
    if (log.action.includes("edited")) return "✏️"
    if (log.action.includes("created")) return "✅"
    if (log.action.includes("submitted")) return "🔒"
    return "📝"
  }

  const getEntityDisplay = (log: AuditLog): string => {
    const entityName =
      parseDetails(log.details)?.grant_name || `${log.entity_type} #${log.entity_id}`
    return entityName
  }

  if (logs.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="text-muted">
            <div className="mb-2" style={{ fontSize: "3rem" }}>
              📭
            </div>
            <h5>No Audit Logs Found</h5>
            <p>No audit events match your current filters.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th style={{ width: "50px" }}></th>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th style={{ width: "100px" }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr
                  key={log.id}
                  onClick={() => onRowClick(log)}
                  style={{ cursor: "pointer" }}
                  className={!log.success ? "table-danger" : ""}
                >
                  <td className="text-center">{getStatusIcon(log)}</td>
                  <td>
                    <div>{formatTimestamp(log.timestamp)}</div>
                    <small className="text-muted">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    <div>{log.user_email}</div>
                    <small className="text-muted">
                      {log.is_admin ? "Admin" : "User"}
                    </small>
                  </td>
                  <td>{getActionBadge(log.action)}</td>
                  <td>
                    <div>{getEntityDisplay(log)}</div>
                    <small className="text-muted">
                      {log.entity_type} #{log.entity_id}
                    </small>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted">
            Showing {logs.length} of {logs.length} records
          </div>
          {logs.length > 0 && (
            <button className="btn btn-outline-secondary btn-sm">
              Export CSV
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
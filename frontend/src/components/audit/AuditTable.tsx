import { JSX } from "react"
import type { AuditLog } from "../../services/api/audit"

interface AuditDetails {
  grant_name?: string
  award_name?: string
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

function exportToCsv(logs: AuditLog[]): void {
  const headers = [
    "ID",
    "Timestamp",
    "User",
    "Is Admin",
    "Action",
    "Entity Type",
    "Entity ID",
    "Success",
    "Failure Reason",
    "IP Address",
  ]

  const escape = (
    val: string | number | boolean | null | undefined,
  ): string => {
    if (val === null || val === undefined) return ""
    const str = String(val)
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replace(/"/g, '""')}"`
      : str
  }

  const rows = logs.map(log =>
    [
      log.id,
      log.timestamp,
      log.user_email,
      log.is_admin,
      log.action,
      log.entity_type,
      log.entity_id,
      log.success,
      log.failure_reason,
      log.ip_address,
    ]
      .map(escape)
      .join(","),
  )

  const csv = [headers.join(","), ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
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
      // Grant actions
      grant_created: { color: "success", label: "Created" },
      grant_edited: { color: "warning", label: "Edited" },
      grant_deleted: { color: "danger", label: "Deleted" },
      // Award actions
      award_created: { color: "success", label: "Created" },
      award_edited: { color: "warning", label: "Edited" },
      award_deleted: { color: "danger", label: "Deleted" },
      // Application actions
      application_created: { color: "success", label: "Created" },
      application_submitted: { color: "info", label: "Submitted" },
      application_edited: { color: "warning", label: "Edited" },
      application_deleted: { color: "danger", label: "Deleted" },
      application_edit_blocked: { color: "danger", label: "Blocked" },
      // Security actions
      login_failed: { color: "danger", label: "Login Failed" },
      unauthorized_access: { color: "danger", label: "Unauthorized" },
    }

    const badge = badges[action] || { color: "secondary", label: action }
    return <span className={`badge bg-${badge.color}`}>{badge.label}</span>
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
    const parsed = parseDetails(log.details)
    return (
      parsed?.grant_name ||
      parsed?.award_name ||
      `${log.entity_type} #${log.entity_id}`
    )
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
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => exportToCsv(logs)}
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  )
}

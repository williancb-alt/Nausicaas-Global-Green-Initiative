import { JSX } from "react"
import type { AuditLog } from "../../services/api/audit"

interface AuditStatsProps {
  logs: AuditLog[]
  timeRange: string // e.g., "Last 7 Days"
}

export function AuditStats({ logs, timeRange }: AuditStatsProps): JSX.Element {
  // Calculate statistics
  const securityEvents = logs.filter(
    log =>
      log.action === "application_edit_blocked" ||
      log.action === "unauthorized_access" ||
      log.action === "login_failed" ||
      !log.success,
  ).length

  const adminActions = logs.filter(log => log.is_admin && log.success).length

  const grantActions = logs.filter(log => log.entity_type === "grant").length

  const applicationActions = logs.filter(
    log => log.entity_type === "application",
  ).length

  return (
    <div className="row g-3 mb-4">
      {/* Security Events Card */}
      <div className="col-md-3">
        <div className="card border-danger">
          <div className="card-body text-center">
            <div className="text-muted small">{timeRange}</div>
            <div className="display-6 my-2">
              {securityEvents > 0 ? "⚠️" : "✅"} {securityEvents}
            </div>
            <div className="fw-semibold">Security Events</div>
            {securityEvents > 0 && (
              <div className="text-danger small mt-1">Requires Attention</div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Actions Card */}
      <div className="col-md-3">
        <div className="card border-primary">
          <div className="card-body text-center">
            <div className="text-muted small">{timeRange}</div>
            <div className="display-6 my-2">📝 {adminActions}</div>
            <div className="fw-semibold">Admin Actions</div>
            <div className="text-muted small mt-1">Successful</div>
          </div>
        </div>
      </div>

      {/* Grants Card */}
      <div className="col-md-3">
        <div className="card border-success">
          <div className="card-body text-center">
            <div className="text-muted small">{timeRange}</div>
            <div className="display-6 my-2">🎯 {grantActions}</div>
            <div className="fw-semibold">Grant Actions</div>
            <div className="text-muted small mt-1">Created/Edited/Deleted</div>
          </div>
        </div>
      </div>

      {/* Applications Card */}
      <div className="col-md-3">
        <div className="card border-info">
          <div className="card-body text-center">
            <div className="text-muted small">{timeRange}</div>
            <div className="display-6 my-2">📋 {applicationActions}</div>
            <div className="fw-semibold">Application Actions</div>
            <div className="text-muted small mt-1">
              Created/Submitted/Edited
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

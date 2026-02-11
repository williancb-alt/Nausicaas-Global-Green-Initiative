import { JSX } from "react"
import type { AuditLog } from "../../services/api/audit"

// Helper to parse details JSON string
interface AuditDetails {
  grant_name?: string
  changes?: Record<string, { old: unknown; new: unknown }>
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

interface AuditDetailModalProps {
  log: AuditLog | null
  onClose: () => void
}

export function AuditDetailModal({
  log,
  onClose,
}: AuditDetailModalProps): JSX.Element | null {
  if (!log) return null

  const details = parseDetails(log.details)

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    })
  }

  const renderChanges = (changes: Record<string, any>) => {
    if (!changes || Object.keys(changes).length === 0) {
      return <div className="text-muted">No changes tracked</div>
    }

    return (
      <table className="table table-sm">
        <thead>
          <tr>
            <th>Field</th>
            <th>Old Value</th>
            <th>New Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(changes).map(([field, change]: [string, any]) => (
            <tr key={field}>
              <td className="fw-semibold">{field}</td>
              <td>
                <code className="text-danger">{change.old || "N/A"}</code>
              </td>
              <td>
                <code className="text-success">{change.new || "N/A"}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1040 }}
      />

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title">
                {log.action.replace(/_/g, " ").toUpperCase()} - Details
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              />
            </div>

            {/* Body */}
            <div className="modal-body">
              {/* Basic Information */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Timestamp</label>
                  <div>{formatTimestamp(log.timestamp)}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">User</label>
                  <div>
                    {log.user_email}
                    <span className="badge bg-secondary ms-2">
                      {log.is_admin ? "Admin" : "User"}
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Entity</label>
                  <div>
                    {log.entity_type} #{log.entity_id}
                  </div>
                  {details?.grant_name && (
                    <small className="text-muted">
                      {details?.grant_name}
                    </small>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Status</label>
                  <div>
                    {log.success ? (
                      <span className="badge bg-success">Success</span>
                    ) : (
                      <span className="badge bg-danger">Failed</span>
                    )}
                  </div>
                  {log.failure_reason && (
                    <small className="text-danger">{log.failure_reason}</small>
                  )}
                </div>
              </div>

              {/* Technical Details */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Technical Information
                </label>
                <div className="border rounded p-3 bg-light">
                  <div className="mb-2">
                    <strong>IP Address:</strong>{" "}
                    <code>{log.ip_address || "N/A"}</code>
                  </div>
                  <div>
                    <strong>User Agent:</strong>
                    <div className="small text-muted text-break">
                      {log.user_agent || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Changes Made (for edit actions) */}
              {log.action.includes("edited") && details?.changes && (
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Changes Made
                  </label>
                  {renderChanges(details?.changes)}
                </div>
              )}

              {/* Additional Details */}
              {log.details && Object.keys(log.details).length > 0 && (
                <div>
                  <label className="form-label fw-semibold">
                    Additional Details
                  </label>
                  <pre className="border rounded p-3 bg-light">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
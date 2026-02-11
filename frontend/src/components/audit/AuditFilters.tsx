import { JSX } from "react"
// AuditAction type available in ../../types if needed

interface AuditFiltersProps {
  onFilterChange: (filters: {
    action: string
    dateRange: string
    userEmail: string
  }) => void
  adminEmails: string[] // List of admin emails for dropdown
}

export function AuditFilters({
  onFilterChange,
  adminEmails,
}: AuditFiltersProps): JSX.Element {
  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const action = e.target.value
    onFilterChange({
      action,
      dateRange: "7days",
      userEmail: "all",
    })
  }

  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="row g-3">
          {/* Action Type Filter */}
          <div className="col-md-4">
            <label htmlFor="actionFilter" className="form-label fw-semibold">
              Action Type
            </label>
            <select
              id="actionFilter"
              className="form-select"
              onChange={handleActionChange}
              defaultValue="all"
            >
              <option value="all">All Actions</option>
              <optgroup label="Grant Actions">
                <option value="grant_created">Grant Created</option>
                <option value="grant_edited">Grant Edited</option>
                <option value="grant_deleted">Grant Deleted</option>
              </optgroup>
              <optgroup label="Application Actions" disabled>
                <option value="application_created">
                  Application Created (Coming Soon)
                </option>
                <option value="application_submitted">
                  Application Submitted (Coming Soon)
                </option>
                <option value="application_edited">
                  Application Edited (Coming Soon)
                </option>
              </optgroup>
              <optgroup label="Security Events" disabled>
                <option value="application_edit_blocked">
                  Edit Blocked (Coming Soon)
                </option>
                <option value="unauthorized_access">
                  Unauthorized Access (Coming Soon)
                </option>
              </optgroup>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="col-md-4">
            <label htmlFor="dateRangeFilter" className="form-label fw-semibold">
              Date Range
            </label>
            <select
              id="dateRangeFilter"
              className="form-select"
              defaultValue="7days"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Admin User Filter */}
          <div className="col-md-4">
            <label htmlFor="userFilter" className="form-label fw-semibold">
              Admin User
            </label>
            <select id="userFilter" className="form-select" defaultValue="all">
              <option value="all">All Admins</option>
              {adminEmails.map(email => (
                <option key={email} value={email}>
                  {email}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3">
          <button className="btn btn-outline-secondary btn-sm me-2">
            Apply Filters
          </button>
          <button className="btn btn-outline-danger btn-sm">
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  )
}
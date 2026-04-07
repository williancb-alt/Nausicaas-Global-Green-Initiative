import { type ChangeEvent, JSX, useState } from "react"

interface FilterState {
  action: string
  dateRange: string
  userEmail: string
}

interface AuditFiltersProps {
  onFilterChange: (filters: FilterState) => void
  adminEmails: string[]
}

const DEFAULT_FILTERS: FilterState = {
  action: "all",
  dateRange: "7days",
  userEmail: "all",
}

export function AuditFilters({
  onFilterChange,
  adminEmails,
}: AuditFiltersProps): JSX.Element {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  const handleChange =
    (field: keyof FilterState) => (e: ChangeEvent<HTMLSelectElement>) => {
      const updated = { ...filters, [field]: e.target.value }
      setFilters(updated)
      onFilterChange(updated)
    }

  const handleClear = () => {
    setFilters(DEFAULT_FILTERS)
    onFilterChange(DEFAULT_FILTERS)
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
              value={filters.action}
              onChange={handleChange("action")}
            >
              <option value="all">All Actions</option>
              <optgroup label="Grant Actions">
                <option value="grant_created">Grant Created</option>
                <option value="grant_edited">Grant Edited</option>
                <option value="grant_deleted">Grant Deleted</option>
              </optgroup>
              <optgroup label="Award Actions">
                <option value="award_created">Award Created</option>
                <option value="award_edited">Award Edited</option>
                <option value="award_deleted">Award Deleted</option>
              </optgroup>
              <optgroup label="Application Actions">
                <option value="application_created">Application Created</option>
                <option value="application_submitted">
                  Application Submitted
                </option>
                <option value="application_edited">Application Edited</option>
                <option value="application_deleted">Application Deleted</option>
              </optgroup>
              <optgroup label="Security Events">
                <option value="application_edit_blocked">Edit Blocked</option>
                <option value="login_failed">Login Failed</option>
                <option value="unauthorized_access">Unauthorized Access</option>
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
              value={filters.dateRange}
              onChange={handleChange("dateRange")}
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
            <select
              id="userFilter"
              className="form-select"
              value={filters.userEmail}
              onChange={handleChange("userEmail")}
            >
              <option value="all">All Users</option>
              {adminEmails.map(email => (
                <option key={email} value={email}>
                  {email}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3">
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleClear}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  )
}

import { Search } from "lucide-react"
import type { Application } from "../../types"
import {
  NO_AWARD_FILTER_VALUE,
  type AwardFilterValue,
} from "../../utils/applications"

export type StatusFilterValue = "all" | Application["status"]

const FILTER_OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: "all", label: "All Applications" },
  { value: "pending_review", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "denied", label: "Rejected" },
]

const activeStyle = {
  backgroundColor: "#3b7a57",
  color: "white",
  borderColor: "#3b7a57",
}

const inactiveStyle = {
  backgroundColor: "transparent",
  color: "#3b7a57",
  borderColor: "#3b7a57",
}

interface ApplicationStatusFilterBarProps {
  statusFilter: StatusFilterValue
  onStatusFilterChange: (value: StatusFilterValue) => void
  searchTerm: string
  onSearchTermChange: (value: string) => void
  searchPlaceholder?: string
  awardFilter?: AwardFilterValue
  onAwardFilterChange?: (value: AwardFilterValue) => void
  awardOptions?: string[]
}

export function ApplicationStatusFilterBar({
  statusFilter,
  onStatusFilterChange,
  searchTerm,
  onSearchTermChange,
  searchPlaceholder = "Search by ID, email or grant...",
  awardFilter,
  onAwardFilterChange,
  awardOptions = [],
}: ApplicationStatusFilterBarProps) {
  return (
    <div className="row mb-4 g-3">
      <div className="col-auto">
        <div className="btn-group" role="group">
          {FILTER_OPTIONS.map(({ value, label }) => {
            const isActive = statusFilter === value
            return (
              <button
                key={value}
                type="button"
                className={`btn ${isActive ? "btn" : "btn-outline"}`}
                style={isActive ? activeStyle : inactiveStyle}
                onClick={() => onStatusFilterChange(value)}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="col">
        <div className="input-group">
          <span
            className="input-group-text"
            style={{
              backgroundColor: "#eef7ee",
              borderColor: "#e6f4e8",
            }}
          >
            <Search size={18} style={{ color: "#3b7a57" }} />
          </span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={e => onSearchTermChange(e.target.value)}
            className="form-control"
            style={{ borderColor: "#d1fae5" }}
          />
        </div>
      </div>

      {onAwardFilterChange && (
        <div className="col-md-3">
          <select
            value={awardFilter ?? "all"}
            onChange={e => onAwardFilterChange(e.target.value)}
            className="form-select"
            style={{ borderColor: "#d1fae5" }}
          >
            <option value="all">All Awards</option>
            <option value={NO_AWARD_FILTER_VALUE}>No Award</option>
            {awardOptions.map(awardName => (
              <option key={awardName} value={awardName}>
                {awardName}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

import { JSX } from "react"
import type { Grant } from "../../../services/api/client"
import { GRANT_MESSAGES } from "../../../utils/constants"
import { GrantRow } from "./GrantRow"

interface GrantListProps {
  grants: Grant[]
  isLoading: boolean
  onEdit: (grant: Grant) => void
  onToggleVisibility: (grant: Grant) => void
  onDelete: (name: string) => void
  togglingGrant: string | null
}

/**
 * Component for listing existing grants in a table.
 */
export function GrantList({
  grants,
  isLoading,
  onEdit,
  onToggleVisibility,
  onDelete,
  togglingGrant,
}: GrantListProps): JSX.Element {
  if (isLoading) {
    return (
      <div
        className="alert"
        style={{
          backgroundColor: "#eef7ee",
          color: "#2f6f44",
          border: "1px solid #3b7a57",
        }}
      >
        {GRANT_MESSAGES.loadingGrants}
      </div>
    )
  }

  if (grants.length === 0) {
    return (
      <div
        className="alert"
        style={{
          backgroundColor: "#eef7ee",
          color: "#2f6f44",
          border: "1px solid #3b7a57",
        }}
      >
        {GRANT_MESSAGES.noGrants}
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table
        className="table table-hover table-sm"
        style={{ backgroundColor: "white" }}
      >
        <thead style={{ backgroundColor: "#eef7ee" }}>
          <tr>
            <th style={{ color: "#2f6f44" }}>Name</th>
            <th style={{ color: "#2f6f44" }}>Deadline</th>
            <th style={{ color: "#2f6f44" }}>Visibility</th>
            <th style={{ color: "#2f6f44", width: "180px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {grants.map(grant => (
            <GrantRow
              key={grant.name}
              grant={grant}
              onEdit={onEdit}
              onToggleVisibility={onToggleVisibility}
              onDelete={onDelete}
              isToggling={togglingGrant === grant.name}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

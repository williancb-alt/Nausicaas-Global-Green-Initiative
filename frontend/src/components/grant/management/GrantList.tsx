import { JSX } from "react"
import { Edit2, Trash2, Eye, EyeOff } from "lucide-react"
import type { Grant } from "../../../services/api/client"
import { GRANT_MESSAGES } from "../../../utils/constants"

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
            <tr key={grant.name}>
              <td>
                <strong style={{ color: "#2f6f44" }}>{grant.name}</strong>
                <br />
                <small className="text-muted">{grant.description || "—"}</small>
              </td>
              <td>{grant.deadline || "—"}</td>
              <td>
                <span
                  className="badge"
                  style={{
                    backgroundColor: grant.hidden ? "#9ca3af" : "#3b7a57",
                    color: "white",
                  }}
                >
                  {grant.hidden ? "Hidden" : "Visible"}
                </span>
              </td>
              <td>
                <div className="d-flex gap-1">
                  <button
                    className="btn btn-sm"
                    style={{
                      backgroundColor: "#eef7ee",
                      color: "#2f6f44",
                      border: "none",
                    }}
                    onClick={() => onEdit(grant)}
                    title="Edit grant"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="btn btn-sm"
                    style={{
                      backgroundColor: "#eef7ee",
                      color: "#2f6f44",
                      border: "none",
                    }}
                    onClick={() => onToggleVisibility(grant)}
                    title={grant.hidden ? "Show grant" : "Hide grant"}
                    disabled={togglingGrant === grant.name}
                  >
                    {togglingGrant === grant.name ? (
                      "..."
                    ) : grant.hidden ? (
                      <EyeOff size={14} />
                    ) : (
                      <Eye size={14} />
                    )}
                  </button>
                  <button
                    className="btn btn-sm"
                    style={{
                      backgroundColor: "#fee2e2",
                      color: "#dc2626",
                      border: "none",
                    }}
                    onClick={() => onDelete(grant.name)}
                    title="Delete grant"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

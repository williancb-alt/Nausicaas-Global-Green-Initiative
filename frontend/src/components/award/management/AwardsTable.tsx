import { JSX } from "react"
import { Edit2, Trash2, Eye, EyeOff } from "lucide-react"
import type { Award } from "../../../services/api/client"

interface VisibilityBadgeProps {
  hidden?: boolean
}

function VisibilityBadge({ hidden }: VisibilityBadgeProps): JSX.Element {
  return (
    <span
      className="badge"
      style={{
        backgroundColor: hidden ? "#9ca3af" : "#3b7a57",
        color: "white",
      }}
    >
      {hidden ? "Hidden" : "Visible"}
    </span>
  )
}

interface AwardRowProps {
  award: Award
  togglingAward: string | null
  onEdit: (award: Award) => void
  onToggleVisibility: (award: Award) => void
  onDelete: (name: string) => void
}

export function AwardRow({
  award,
  togglingAward,
  onEdit,
  onToggleVisibility,
  onDelete,
}: AwardRowProps): JSX.Element {
  const isToggling = togglingAward === award.name

  return (
    <tr>
      <td>
        <strong style={{ color: "#2f6f44" }}>{award.name}</strong>
      </td>
      <td>{award.deadline || "—"}</td>
      <td>{award.description || "—"}</td>
      <td>
        <VisibilityBadge hidden={award.hidden || false} />
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
            onClick={() => onEdit(award)}
            title="Edit award"
            type="button"
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
            onClick={() => onToggleVisibility(award)}
            title={award.hidden ? "Show award" : "Hide award"}
            disabled={isToggling}
            type="button"
          >
            {isToggling ? (
              "..."
            ) : award.hidden ? (
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
            onClick={() => onDelete(award.name)}
            title="Delete award"
            type="button"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

interface AwardsTableProps {
  awards: Award[]
  togglingAward: string | null
  onEdit: (award: Award) => void
  onToggleVisibility: (award: Award) => void
  onDelete: (name: string) => void
}

export function AwardsTable({
  awards,
  togglingAward,
  onEdit,
  onToggleVisibility,
  onDelete,
}: AwardsTableProps): JSX.Element {
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
            <th style={{ color: "#2f6f44" }}>Description</th>
            <th style={{ color: "#2f6f44" }}>Visibility</th>
            <th style={{ color: "#2f6f44", width: "180px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {awards.map(award => (
            <AwardRow
              key={award.name}
              award={award}
              togglingAward={togglingAward}
              onEdit={onEdit}
              onToggleVisibility={onToggleVisibility}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

import { JSX } from "react"
import { Edit2, Trash2, Eye, EyeOff } from "lucide-react"
import type { Grant } from "../../../services/api/client"

export function GrantRow({
  grant,
  onEdit,
  onToggleVisibility,
  onDelete,
  isToggling,
}: {
  grant: Grant
  onEdit: (grant: Grant) => void
  onToggleVisibility: (grant: Grant) => void
  onDelete: (name: string) => void
  isToggling: boolean
}): JSX.Element {
  return (
    <tr>
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
            disabled={isToggling}
          >
            {isToggling ? (
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
  )
}

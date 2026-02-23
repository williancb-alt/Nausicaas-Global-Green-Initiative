import { JSX } from "react"
import { Grant } from "../../services/api"

export function GrantHeader({
  grant,
  hasApplied,
}: {
  grant: Grant
  hasApplied: boolean
}): JSX.Element {
  return (
    <div>
      <div className="fw-semibold d-flex align-items-center gap-2">
        {grant.name}
        {hasApplied && (
          <span className="badge bg-success" style={{ fontSize: "0.7rem" }}>
            ✓ Applied
          </span>
        )}
      </div>
      {grant.deadline && (
        <div className="text-muted small">Deadline: {grant.deadline}</div>
      )}
    </div>
  )
}

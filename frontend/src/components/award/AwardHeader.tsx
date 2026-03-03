import { JSX } from "react"
import { Award } from "../../services/api"

export function AwardHeader({
  award,
}: {
  award: Award
}): JSX.Element {
  return (
    <div>
      <div className="fw-semibold d-flex align-items-center gap-2">
        {award.name}
      </div>
      {award.deadline && (
        <div className="text-muted small">Deadline: {award.deadline}</div>
      )}
    </div>
  )
}

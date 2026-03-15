import { JSX } from "react"
import { Award } from "../../services/api"

export function AwardDetails({ award }: { award: Award }): JSX.Element | null {
  if (!award.description) {
    return (
      <div className="text-muted">
        <em>No additional field data available for this award.</em>
      </div>
    )
  }

  return (
    <>
      {award.description && (
        <div className="mb-2">
          <strong>Description:</strong>
          <p className="mb-1">{award.description}</p>
        </div>
      )}
    </>
  )
}

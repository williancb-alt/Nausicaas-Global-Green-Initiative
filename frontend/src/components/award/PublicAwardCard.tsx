import { JSX } from "react"
import type { Award } from "../../services/api/client"

export interface PublicAwardCardProps {
  award: Award
}

export function PublicAwardCard({ award }: PublicAwardCardProps): JSX.Element {
  return (
    <div
      className="card mb-3"
      style={{
        border: "2px solid #3b7a57",
        borderRadius: "8px",
      }}
    >
      <div
        className="card-header d-flex justify-content-between align-items-center"
        style={{
          backgroundColor: "#3b7a57",
          color: "white",
        }}
      >
        <h5 className="mb-0 fw-bold">{award.name}</h5>
        <div className="d-flex gap-2">
          {award.deadline_passed ? (
            <span className="badge bg-danger">Deadline Passed</span>
          ) : (
            <span className="badge bg-light text-dark">
              {award.time_remaining} remaining
            </span>
          )}
        </div>
      </div>

      <div className="card-body" style={{ backgroundColor: "#f8fdf8" }}>
        {award.description && (
          <p className="card-text mb-3">{award.description}</p>
        )}

        <div className="d-flex justify-content-between align-items-center">
          <div className="text-muted small">
            <strong>Deadline:</strong> {award.deadline}
          </div>
        </div>
      </div>
    </div>
  )
}

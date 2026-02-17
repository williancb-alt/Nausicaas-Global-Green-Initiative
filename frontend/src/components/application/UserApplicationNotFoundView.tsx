import type { JSX } from "react"

interface UserApplicationNotFoundViewProps {
  onBack: () => void
}

export function UserApplicationNotFoundView({
  onBack,
}: UserApplicationNotFoundViewProps): JSX.Element {
  return (
    <div
      style={{ backgroundColor: "#eef7ee", minHeight: "100vh" }}
      className="py-4"
    >
      <div className="container">
        <div className="alert alert-danger">Application not found</div>
        <button className="btn btn-secondary" onClick={onBack}>
          Back to My Applications
        </button>
      </div>
    </div>
  )
}

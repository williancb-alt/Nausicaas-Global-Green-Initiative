import { JSX } from "react"
import { Application } from "../../types"
import { Link } from "react-router-dom"
import { LIST_STATUS_CONFIG } from "./statusConfig"

interface ApplicationListProps {
  isLoading: boolean
  isError: boolean
  applications: Application[]
  onViewDetails: (id: number) => void
}

export function ApplicationList({
  isLoading,
  isError,
  applications,
  onViewDetails,
}: ApplicationListProps): JSX.Element {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading your applications...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="alert alert-danger">
        Unable to load your applications. Please try again later.
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div
        className="card text-center py-5"
        style={{ border: "2px solid #3b7a57" }}
      >
        <div className="card-body">
          <h5 className="text-muted mb-3">
            You have not applied to any grants yet.
          </h5>
          <p className="text-muted mb-4">
            Browse available grants and submit your first application.
          </p>
          <Link to="/" className="btn btn-success">
            View Available Grants
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="row">
      {applications.map(app => {
        const status =
          LIST_STATUS_CONFIG[app.status] || LIST_STATUS_CONFIG.pending_review
        const StatusIcon = status.icon

        return (
          <div key={app.id} className="col-md-6 mb-4">
            <div className="card h-100" style={{ border: "2px solid #3b7a57" }}>
              <div
                className="card-header d-flex justify-content-between align-items-center"
                style={{ backgroundColor: "#3b7a57", color: "white" }}
              >
                <h5 className="mb-0">{app.grant.name}</h5>
                <div className="d-flex align-items-center gap-2">
                  <StatusIcon size={18} />
                  <span className={`badge bg-${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>
              <div className="card-body">
                {app.grant.description && (
                  <p className="mb-2 text-muted">{app.grant.description}</p>
                )}
                <p className="mb-2 text-muted">
                  <small>
                    Submitted:{" "}
                    {new Date(app.submitted_date).toLocaleDateString()}
                  </small>
                </p>
                <button
                  className="btn btn-sm"
                  style={{ backgroundColor: "#3b7a57", color: "white" }}
                  onClick={() => onViewDetails(app.id)}
                >
                  View Details
                </button>
              </div>
              {app.feedback && (
                <div className="card-footer bg-light">
                  <strong>Feedback:</strong>
                  <p className="mb-0 mt-1">{app.feedback}</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

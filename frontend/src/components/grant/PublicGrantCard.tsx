import { JSX, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../button/Button"
import { useAuthStore } from "../../store/authStore"
import type { Grant } from "../../services/api/client"
import { ApplicationStatusBadge } from "../application/ApplicationStatusBadge"
import { ApplicationStatusButton } from "../application/ApplicationStatusButton"
import type { ApplicationEntry } from "../../pages/LandingPage"

export interface PublicGrantCardProps {
  grant: Grant
  applicationStatus?: ApplicationEntry | undefined
}

export function PublicGrantCard({
  grant,
  applicationStatus,
}: PublicGrantCardProps): JSX.Element {
  const hasApplied = !!applicationStatus
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const [showAdminAlert, setShowAdminAlert] = useState(false)

  const handleApply = () => {
    if (!isAuthenticated) {
      void navigate("/login", {
        state: { from: `/grants/${encodeURIComponent(grant.name)}/apply` },
      })
      return
    }

    if (user?.admin) {
      setShowAdminAlert(true)
      return
    }

    void navigate(`/grants/${encodeURIComponent(grant.name)}/apply`)
  }

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
        <h5 className="mb-0 fw-bold">{grant.name}</h5>
        <div className="d-flex gap-2">
          <ApplicationStatusBadge status={applicationStatus?.status} />
          {grant.deadline_passed ? (
            <span className="badge bg-danger">Deadline Passed</span>
          ) : (
            <span className="badge bg-light text-dark">
              {grant.time_remaining} remaining
            </span>
          )}
        </div>
      </div>

      <div className="card-body" style={{ backgroundColor: "#f8fdf8" }}>
        {grant.description && (
          <p className="card-text mb-3">{grant.description}</p>
        )}

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="text-muted small">
            <strong>Deadline:</strong> {grant.deadline}
          </div>

          {!grant.deadline_passed &&
            (hasApplied ? (
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <ApplicationStatusButton status={applicationStatus?.status} />
                <button
                  className="btn btn-sm btn-outline-primary"
                  style={{ borderRadius: "8px" }}
                  onClick={() =>
                    void navigate(`/applications/${applicationStatus!.id}`)
                  }
                >
                  View Application
                </button>
                <button
                  className="btn btn-sm"
                  style={{
                    backgroundColor: "#3b7a57",
                    color: "white",
                    borderRadius: "8px",
                  }}
                  onClick={() => void navigate("/dashboard")}
                >
                  Manage in Dashboard
                </button>
              </div>
            ) : (
              <Button variant="success" onClick={handleApply}>
                Apply Now
              </Button>
            ))}
        </div>

        {showAdminAlert && (
          <div className="alert alert-warning mt-3 mb-0" role="alert">
            <strong>Notice:</strong> Administrators may not apply to grants.
            <button
              type="button"
              className="btn-close float-end"
              onClick={() => setShowAdminAlert(false)}
              aria-label="Close"
            />
          </div>
        )}
      </div>
    </div>
  )
}

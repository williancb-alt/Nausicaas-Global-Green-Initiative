import { JSX, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../button/Button"
import { useAuthStore } from "../../store/authStore"
import type { Grant } from "../../services/api/client"

interface PublicGrantCardProps {
  grant: Grant
  applicationStatus?: string | undefined
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
          {applicationStatus && (
            <span
              className={`badge ${
                applicationStatus === "approved"
                  ? "bg-success"
                  : applicationStatus === "denied"
                    ? "bg-danger"
                    : applicationStatus === "in_review"
                      ? "bg-info"
                      : "bg-warning text-dark"
              }`}
            >
              {applicationStatus === "approved"
                ? "✓ Approved"
                : applicationStatus === "denied"
                  ? "✗ Denied"
                  : applicationStatus === "in_review"
                    ? "In Review"
                    : "Pending Review"}
            </span>
          )}
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

        <div className="d-flex justify-content-between align-items-center">
          <div className="text-muted small">
            <strong>Deadline:</strong> {grant.deadline}
          </div>

          {!grant.deadline_passed &&
            (hasApplied ? (
              <Button
                variant={
                  applicationStatus === "approved"
                    ? "success"
                    : applicationStatus === "denied"
                      ? "danger"
                      : "secondary"
                }
                disabled
              >
                {applicationStatus === "approved"
                  ? "✓ Application Approved"
                  : applicationStatus === "denied"
                    ? "✗ Application Denied"
                    : "Application Submitted"}
              </Button>
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

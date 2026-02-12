import { JSX, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../button/Button"
import { useAuthStore } from "../../store/authStore"
import type { Grant } from "../../services/api/client"

interface PublicGrantCardProps {
  grant: Grant
  hasApplied?: boolean
}

export function PublicGrantCard({ grant, hasApplied = false }: PublicGrantCardProps): JSX.Element {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const [showAdminAlert, setShowAdminAlert] = useState(false)

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/grants/${grant.name}/apply` } })
      return
    }

    if (user?.admin) {
      setShowAdminAlert(true)
      return
    }

    navigate(`/grants/${grant.name}/apply`)
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
          {hasApplied && (
            <span className="badge bg-success">
              ✓ Applied
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

          {!grant.deadline_passed && (
            hasApplied ? (
              <Button variant="secondary" disabled>
                ✓ Already Applied
              </Button>
            ) : (
              <Button variant="success" onClick={handleApply}>
                Apply Now
              </Button>
            )
          )}
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

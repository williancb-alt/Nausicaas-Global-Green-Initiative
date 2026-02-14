import { JSX } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useApplication } from "../hooks/useApplicationHooks"

export function UserApplicationView(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: application, isLoading } = useApplication(id)

  if (isLoading) {
    return (
      <div
        style={{ backgroundColor: "#eef7ee", minHeight: "100vh" }}
        className="py-4"
      >
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading application details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div
        style={{ backgroundColor: "#eef7ee", minHeight: "100vh" }}
        className="py-4"
      >
        <div className="container">
          <div className="alert alert-danger">Application not found</div>
          <button
            className="btn btn-secondary"
            onClick={() => void navigate("/applications")}
          >
            Back to My Applications
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{ backgroundColor: "#eef7ee", minHeight: "100vh" }}
      className="py-4"
    >
      <div className="container">
        <div className="card mb-4" style={{ border: "2px solid #3b7a57" }}>
          <div
            className="card-header"
            style={{ backgroundColor: "#3b7a57", color: "white" }}
          >
            <h3 className="h5 mb-0">Application Details</h3>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <strong>Grant:</strong> {application.grant.name}
            </div>

            {application.grant.description && (
              <div className="mb-3">
                <strong>Grant Description:</strong>
                <p className="mb-0 mt-1 text-muted">
                  {application.grant.description}
                </p>
              </div>
            )}

            <div className="mb-3">
              <strong>Submitted:</strong> {application.submitted_date}
            </div>

            <div className="mb-3">
              <strong>Status:</strong>{" "}
              <span
                className={`badge bg-${
                  application.status === "approved"
                    ? "success"
                    : application.status === "denied"
                      ? "danger"
                      : application.status === "in_review"
                        ? "info"
                        : "warning"
                }`}
              >
                {application.status === "approved"
                  ? "Approved"
                  : application.status === "denied"
                    ? "Denied"
                    : application.status === "in_review"
                      ? "In Review"
                      : "Pending Review"}
              </span>
            </div>

            {application.field_values &&
              Object.keys(application.field_values).length > 0 && (
                <div className="mb-3">
                  <strong>Your Responses:</strong>
                  <div className="mt-2 p-3 bg-light rounded">
                    {Object.entries(application.field_values).map(
                      ([key, value]) => {
                        // Extract index from keys like "field_0", "field_1"
                        const indexMatch = key.match(/^field_(\d+)$/)
                        let label = key
                        if (
                          indexMatch &&
                          application.grant.custom_fields?.configs
                        ) {
                          const fieldIndex = parseInt(indexMatch[1], 10)
                          const fieldConfig =
                            application.grant.custom_fields.configs[fieldIndex]
                          if (fieldConfig) {
                            label = fieldConfig.label
                          }
                        }
                        return (
                          <div key={key} className="mb-2">
                            <strong style={{ color: "#2f6f44" }}>
                              {label}:
                            </strong>{" "}
                            {value}
                          </div>
                        )
                      },
                    )}
                  </div>
                </div>
              )}

            {application.feedback && (
              <div className="mb-3">
                <strong>Feedback from Reviewer:</strong>
                <div className="alert alert-info mt-2" role="alert">
                  {application.feedback}
                </div>
              </div>
            )}

            <div className="d-flex gap-2">
              <button
                className="btn btn-secondary"
                onClick={() => void navigate("/applications")}
              >
                Back to My Applications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserApplicationView

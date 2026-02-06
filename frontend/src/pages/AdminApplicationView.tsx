import { JSX } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useApplication } from "../hooks/useApplicationHooks"

export function AdminApplicationView(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: application, isLoading } = useApplication(id)

  if (isLoading) {
    return <div className="container py-4">Loading...</div>
  }

  if (!application) {
    return (
      <div className="container py-4">
        <p className="text-danger">Application not found</p>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <div className="card mb-4">
        <div className="card-header" style={{ backgroundColor: "#3b7a57", color: "white" }}>
          <h3 className="h5 mb-0">Application #{application.id}</h3>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <strong>Grant:</strong> {application.grant.name}
          </div>

          <div className="mb-3">
            <strong>Applicant:</strong> {application.applicant.email}
          </div>

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
                  : "warning"
              }`}
            >
              {application.status.replace("_", " ")}
            </span>
          </div>

          {application.field_values && Object.keys(application.field_values).length > 0 && (
            <div className="mb-3">
              <strong>Application Details:</strong>
              <div className="mt-2 p-3 bg-light rounded">
                {Object.entries(application.field_values).map(([key, value]) => {
                  // Extract index from keys like "field_0", "field_1"
                  const indexMatch = key.match(/^field_(\d+)$/)
                  let label = key
                  if (indexMatch && application.grant.custom_fields?.configs) {
                    const fieldIndex = parseInt(indexMatch[1], 10)
                    const fieldConfig = application.grant.custom_fields.configs[fieldIndex]
                    if (fieldConfig) {
                      label = fieldConfig.label
                    }
                  }
                  return (
                    <div key={key} className="mb-2">
                      <strong>{label}:</strong> {value}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {application.feedback && (
            <div className="mb-3">
              <strong>Feedback:</strong>
              <p className="mt-1">{application.feedback}</p>
            </div>
          )}

          <div className="d-flex gap-2">
            <button className="btn btn-success">Approve</button>
            <button className="btn btn-danger">Deny</button>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminApplicationView

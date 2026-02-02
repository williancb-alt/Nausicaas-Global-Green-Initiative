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
        <div className="card-body">
          <h3 className="h5">{application.projectTitle}</h3>
          <p className="text-muted">Submitted: {application.submittedDate}</p>

          <div className="mb-3">
            <strong>Organization:</strong> {application.organization}
          </div>

          <div className="mb-3">
            <strong>Requested Amount:</strong> ${application.requestedAmount.toLocaleString()}
          </div>

          <div className="mb-3">
            <strong>Purpose:</strong>
            <p>{application.projectPurpose}</p>
          </div>

          <div className="mb-3">
            <strong>Description:</strong>
            <p>{application.projectDescription}</p>
          </div>

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

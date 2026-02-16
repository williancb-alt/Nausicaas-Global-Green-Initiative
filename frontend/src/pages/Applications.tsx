import { JSX } from "react"
import { useNavigate } from "react-router-dom"
import { useApplications } from "../hooks/useApplicationHooks"
import { CheckCircle2, XCircle, Clock, FileText } from "lucide-react"

const statusConfig = {
  approved: { label: "Approved", color: "success", icon: CheckCircle2 },
  denied: { label: "Denied", color: "danger", icon: XCircle },
  pending_review: { label: "Pending Review", color: "warning", icon: Clock },
  in_review: { label: "In Review", color: "info", icon: Clock },
  opened: { label: 'Opened', color: 'text-blue-600 bg-blue-100', icon: FileText },
}

export function Applications(): JSX.Element {
  const navigate = useNavigate()
  const { data: applicationsData, isLoading, isError } = useApplications()
  const applications = applicationsData?.items ?? []

  if (isLoading) {
    return (
      <div className="container py-4">
        <h1 className="h4 mb-3">Applications</h1>
        <div className="alert alert-info">Loading applications...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container py-4">
        <h1 className="h4 mb-3">Applications</h1>
        <div className="alert alert-danger">Failed to load applications</div>
      </div>
    )
  }

  const handleViewApplication = (id: number) => {
    navigate(`/admin/applications/${id}`)
  }

  return (
    <div style={{ backgroundColor: "#f0fdf4", minHeight: "100vh" }} className="py-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0" style={{ color: "#2f6f44", fontWeight: "700" }}>
            All Applications
          </h1>
          <span
            className="badge"
            style={{ backgroundColor: "#3b7a57", color: "white", fontSize: "0.95rem" }}
          >
            {applications.length} total
          </span>
        </div>

        {applications.length === 0 ? (
          <div
            className="alert"
            style={{
              backgroundColor: "#eef7ee",
              color: "#2f6f44",
              border: "1px solid #3b7a57",
            }}
          >
            No applications submitted yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover" style={{ backgroundColor: "white" }}>
              <thead style={{ backgroundColor: "#d1fae5" }}>
                <tr>
                  <th style={{ color: "#047857" }}>ID</th>
                  <th>Applicant</th>
                  <th>Grant</th>
                  <th>Status</th>
                  <th>Submitted Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => {
                  const status = statusConfig[app.status] || statusConfig.pending_review
                  const StatusIcon = status.icon
                  return (
                    <tr key={app.id}>
                      <td>
                        <code className="text-primary">{app.id}</code>
                      </td>
                      <td>
                        <div className="fw-bold">{app.applicant.email}</div>
                      </td>
                      <td>{app.grant.name}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <StatusIcon size={16} className={`text-${status.color}`} />
                          <span className={`badge bg-${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </td>
                      <td>
                        <small>
                          {new Date(app.submitted_date).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewApplication(app.id)}
                          title="Review application"
                        >
                          <FileText size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Applications

import { Application } from "../../types"
import { FileText } from "lucide-react"
import { StatusBadge } from "../badge/StatusBadge"

export function AdminDashboardApplicationsTable({
  applications,
  onViewApplication,
}: {
  applications: Application[]
  onViewApplication: (id: number) => void
}) {
  if (applications.length === 0) {
    return (
      <div className="text-center py-5">
        <FileText
          size={48}
          style={{ color: "#e6f4e8" }}
          className="mb-3 mx-auto d-block"
        />
        <p className="text-muted">No applications found</p>
      </div>
    )
  }

  return (
    <table className="table table-hover">
      <thead style={{ backgroundColor: "#eef7ee" }}>
        <tr>
          <th style={{ color: "#2f6f44", fontWeight: "600" }}>ID</th>
          <th style={{ color: "#2f6f44", fontWeight: "600" }}>Applicant</th>
          <th style={{ color: "#2f6f44", fontWeight: "600" }}>Grant</th>
          <th style={{ color: "#2f6f44", fontWeight: "600" }}>Submitted</th>
          <th style={{ color: "#2f6f44", fontWeight: "600" }}>Status</th>
          <th style={{ color: "#2f6f44", fontWeight: "600" }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {applications.map(app => (
          <tr key={app.id} style={{ borderColor: "#f0fdf4" }}>
            <td>
              <code style={{ color: "#3b7a57", fontWeight: "600" }}>
                {app.id}
              </code>
            </td>
            <td style={{ color: "#047857", fontWeight: "500" }}>
              {app.applicant.email}
            </td>
            <td>{app.grant.name}</td>
            <td className="text-muted">{app.submitted_date}</td>
            <td>
              <StatusBadge status={app.status} />
            </td>
            <td>
              <button
                onClick={() => onViewApplication(app.id)}
                className="btn btn-sm"
                style={{
                  backgroundColor: "#3b7a57",
                  color: "white",
                  fontWeight: "500",
                }}
              >
                Review
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

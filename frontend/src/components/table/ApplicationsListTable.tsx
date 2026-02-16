import { FileText, CheckCircle2, XCircle, Clock } from "lucide-react"
import type { Application } from "../../types"

const statusConfig = {
  approved: { label: "Approved", color: "success", icon: CheckCircle2 },
  denied: { label: "Denied", color: "danger", icon: XCircle },
  pending_review: { label: "Pending Review", color: "warning", icon: Clock },
  in_review: { label: "In Review", color: "info", icon: Clock },
} as const

interface ApplicationsListTableProps {
  applications: Application[]
  onViewApplication: (id: number) => void
}

export function ApplicationsListTable({
  applications,
  onViewApplication,
}: ApplicationsListTableProps) {
  return (
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
            const status =
              statusConfig[app.status] ?? statusConfig.pending_review
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
                    onClick={() => onViewApplication(app.id)}
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
  )
}

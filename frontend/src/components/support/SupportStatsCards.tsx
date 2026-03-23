import { JSX } from "react"
import { MessageSquare, Clock, CheckCircle2 } from "lucide-react"

/**
 * Stats cards for the Support Messages Page.
 */
export function SupportStatsCards({
  pending,
  replied,
}: {
  pending: number
  replied: number
}): JSX.Element {
  return (
    <div className="row g-4 mb-4">
      <div className="col-md-4">
        <div className="card border-0 shadow-sm h-100 bg-white">
          <div className="card-body p-4 d-flex align-items-center gap-3">
            <div className="p-3 rounded-pill bg-primary bg-opacity-10">
              <MessageSquare className="text-primary" />
            </div>
            <div>
              <h3 className="h4 mb-0 fw-bold">{pending + replied}</h3>
              <p className="text-muted small mb-0">Total Messages</p>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card border-0 shadow-sm h-100 bg-white">
          <div className="card-body p-4 d-flex align-items-center gap-3">
            <div className="p-3 rounded-pill bg-warning bg-opacity-10">
              <Clock className="text-warning" />
            </div>
            <div>
              <h3 className="h4 mb-0 fw-bold">{pending}</h3>
              <p className="text-muted small mb-0">Pending Review</p>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card border-0 shadow-sm h-100 bg-white">
          <div className="card-body p-4 d-flex align-items-center gap-3">
            <div className="p-3 rounded-pill bg-success bg-opacity-10">
              <CheckCircle2 className="text-success" />
            </div>
            <div>
              <h3 className="h4 mb-0 fw-bold">{replied}</h3>
              <p className="text-muted small mb-0">Successfully Replied</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import type { JSX } from "react"
import type { Application } from "../../types"
import { UserApplicationResponses } from "./UserApplicationResponses"

interface UserApplicationDetailsProps {
  application: Application
  onBack: () => void
}

const STATUS_CONFIG: Record<
  Application["status"],
  { label: string; variant: string }
> = {
  approved: { label: "Approved", variant: "success" },
  denied: { label: "Denied", variant: "danger" },
  in_review: { label: "In Review", variant: "info" },
  pending_review: { label: "Pending Review", variant: "warning" },
}

function ApplicationStatusBadge({
  status,
}: {
  status: Application["status"]
}): JSX.Element {
  const config = STATUS_CONFIG[status]
  return <span className={`badge bg-${config.variant}`}>{config.label}</span>
}

function ReviewerFeedback({
  feedback,
}: {
  feedback: string | null | undefined
}): JSX.Element | null {
  if (!feedback) {
    return null
  }

  return (
    <div className="mb-3">
      <strong>Feedback from Reviewer:</strong>
      <div className="alert alert-info mt-2" role="alert">
        {feedback}
      </div>
    </div>
  )
}

export function UserApplicationDetails({
  application,
  onBack,
}: UserApplicationDetailsProps): JSX.Element {
  const customFieldConfigs = application.grant.custom_fields?.configs ?? null

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
              <ApplicationStatusBadge status={application.status} />
            </div>

            <UserApplicationResponses
              fieldValues={application.field_values}
              customFieldConfigs={customFieldConfigs}
            />

            <ReviewerFeedback feedback={application.feedback} />

            <div className="d-flex gap-2">
              <button className="btn btn-secondary" onClick={onBack}>
                Back to My Applications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

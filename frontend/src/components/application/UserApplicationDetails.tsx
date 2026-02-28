import { JSX, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { Application } from "../../types"
import { UserApplicationResponses } from "./UserApplicationResponses"
import { SubmissionLockedModal } from "./SubmissionLockedModal"
import {
  Calendar,
  FileText,
  Info,
  Lock,
  MessageSquare,
  ArrowLeft,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  XCircle,
} from "lucide-react"

interface UserApplicationDetailsProps {
  application: Application
  onBack: () => void
}

const STATUS_CONFIG = {
  approved: {
    label: "Approved",
    color: "#3b7a57",
    icon: CheckCircle2,
    bgColor: "#eef7ee",
  },
  denied: {
    label: "Denied",
    color: "#ef4444",
    icon: XCircle,
    bgColor: "#fee2e2",
  },
  in_review: {
    label: "In Review",
    color: "#3b82f6",
    icon: Clock,
    bgColor: "#eff6ff",
  },
  pending_review: {
    label: "Pending Review",
    color: "#f59e0b",
    icon: Clock,
    bgColor: "#fffbeb",
  },
} as const

function ApplicationHeroHeader({
  application,
  onBack,
  status,
}: {
  application: Application
  onBack: () => void
  status: (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG]
}) {
  const StatusIcon = status.icon
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #3b7a57 0%, #2d5a41 100%)",
        padding: "3rem 0",
        color: "white",
        marginBottom: "0",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}
    >
      <div className="container">
        <button
          onClick={onBack}
          className="btn btn-link text-white p-0 mb-4 d-flex align-items-center gap-2"
          style={{ textDecoration: "none", opacity: 0.8 }}
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <div className="row align-items-center">
          <div className="col-md-9">
            <div className="d-flex align-items-center gap-3 mb-2">
              <span
                className="badge"
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(4px)",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                }}
              >
                Application #{application.id}
              </span>
              <span
                className="badge d-flex align-items-center gap-1"
                style={{
                  backgroundColor: "white",
                  color: status.color,
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                }}
              >
                <StatusIcon size={16} />
                {status.label}
              </span>
            </div>
            <h1 className="display-5 fw-bold mb-0">{application.grant.name}</h1>
          </div>
          <div className="col-md-3 text-md-end mt-4 mt-md-0">
            <div className="text-white opacity-75 small mb-1">Submitted On</div>
            <div className="h5 mb-0 fw-bold">{application.submitted_date}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SubmissionLockedStrip({
  onReopenModal,
}: {
  onReopenModal: () => void
}) {
  const navigate = useNavigate()

  return (
    <div
      style={{
        backgroundColor: "#eef7ee",
        borderBottom: "2px solid #bbf7d0",
      }}
    >
      <div className="container py-3">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div
            className="d-flex align-items-center gap-2"
            style={{ color: "#2d5a41" }}
          >
            <Lock size={20} />
            <span style={{ fontSize: "1.05rem" }}>
              <strong>Read-only</strong> — submitted applications cannot be
              edited.{" "}
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={onReopenModal}
                style={{
                  color: "#3b7a57",
                  fontSize: "1.05rem",
                  verticalAlign: "baseline",
                }}
              >
                Why?
              </button>
            </span>
          </div>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => void navigate("/")}
            style={{
              backgroundColor: "#3b7a57",
              color: "white",
              borderRadius: "8px",
              padding: "0.35rem 0.9rem",
            }}
          >
            <LayoutDashboard size={15} className="me-1" />
            View Available Grants
          </button>
        </div>
      </div>
    </div>
  )
}

function ApplicationReviewerFeedback({ feedback }: { feedback: string }) {
  return (
    <div
      className="card border-0 shadow-sm"
      style={{
        borderRadius: "16px",
        backgroundColor: "#fffbeb",
        border: "1px solid #fef3c7",
      }}
    >
      <div className="card-body p-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <MessageSquare className="text-warning" size={24} />
          <h2 className="h4 mb-0 fw-bold" style={{ color: "#92400e" }}>
            Reviewer Feedback
          </h2>
        </div>
        <div
          className="p-3 bg-white rounded shadow-sm"
          style={{ borderLeft: "4px solid #f59e0b" }}
        >
          {feedback}
        </div>
      </div>
    </div>
  )
}

function ApplicationGrantOverview({
  grant,
  submittedDate,
}: {
  grant: Application["grant"]
  submittedDate: string
}) {
  return (
    <div
      className="card border-0 shadow-sm mb-4"
      style={{ borderRadius: "16px" }}
    >
      <div className="card-body p-4">
        <div className="d-flex align-items-center gap-2 mb-4">
          <Info className="text-primary" size={24} />
          <h2 className="h5 mb-0 fw-bold" style={{ color: "#2d5a41" }}>
            Grant Overview
          </h2>
        </div>

        <div className="mb-4">
          <label className="text-muted small text-uppercase fw-bold mb-1 d-block">
            Program Name
          </label>
          <div className="fw-semibold">{grant.name}</div>
        </div>

        {grant.description && (
          <div className="mb-4">
            <label className="text-muted small text-uppercase fw-bold mb-1 d-block">
              Description
            </label>
            <p className="mb-0 text-muted" style={{ lineHeight: "1.6" }}>
              {grant.description}
            </p>
          </div>
        )}

        <div
          className="d-flex align-items-center gap-3 p-3 bg-light rounded"
          style={{ border: "1px solid #e2e8f0" }}
        >
          <div className="bg-white p-2 rounded shadow-sm">
            <Calendar className="text-success" size={20} />
          </div>
          <div>
            <label className="text-muted small d-block">Submission Date</label>
            <span className="fw-bold">{submittedDate}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ApplicationNeedHelpCard() {
  return (
    <div
      className="card border-0 shadow-sm overflow-hidden"
      style={{
        borderRadius: "16px",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      }}
    >
      <div className="card-body p-4">
        <h3 className="h6 fw-bold mb-3">
          Need assistance or want to make changes to your application?
        </h3>
        <p className="small text-muted mb-4">
          If you have questions about your application or the review process,
          please reach out to our environmental program office.
        </p>
        <button
          className="btn btn-outline-success w-100"
          style={{ borderRadius: "10px" }}
        >
          Contact Support
        </button>
      </div>
    </div>
  )
}

export function UserApplicationDetails({
  application,
  onBack,
}: UserApplicationDetailsProps): JSX.Element {
  const [isLockedModalOpen, setIsLockedModalOpen] = useState(true)
  const customFieldConfigs = application.grant.custom_fields?.configs ?? null
  const status =
    STATUS_CONFIG[application.status] || STATUS_CONFIG.pending_review

  return (
    <div
      style={{ backgroundColor: "#f0fdf4", minHeight: "100vh" }}
      className="pb-5"
    >
      <SubmissionLockedModal
        isOpen={isLockedModalOpen}
        onClose={() => setIsLockedModalOpen(false)}
        status={application.status}
        submittedDate={application.submitted_date}
      />

      <ApplicationHeroHeader
        application={application}
        onBack={onBack}
        status={status}
      />

      <SubmissionLockedStrip onReopenModal={() => setIsLockedModalOpen(true)} />

      <div className="container mt-4">
        <div className="row g-4">
          <div className="col-lg-8">
            <div
              className="card border-0 shadow-sm mb-4"
              style={{ borderRadius: "16px" }}
            >
              <div className="card-body p-4">
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <FileText className="text-success" size={24} />
                    <h2
                      className="h4 mb-0 fw-bold"
                      style={{ color: "#2d5a41" }}
                    >
                      Review your application responses
                    </h2>
                  </div>
                  <p
                    className="text-muted mb-0 ms-1"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Your submitted application has been sent and is now
                    read-only. To request making a change, please reach out to
                    Customer Support.
                  </p>
                </div>

                <UserApplicationResponses
                  fieldValues={application.field_values}
                  customFieldConfigs={customFieldConfigs}
                />
              </div>
            </div>

            {application.feedback && (
              <ApplicationReviewerFeedback feedback={application.feedback} />
            )}
          </div>

          <div className="col-lg-4">
            <ApplicationGrantOverview
              grant={application.grant}
              submittedDate={application.submitted_date}
            />
            <ApplicationNeedHelpCard />
          </div>
        </div>
      </div>
    </div>
  )
}

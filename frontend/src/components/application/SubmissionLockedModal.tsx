import { JSX, useEffect } from "react"
import { Lock, Calendar, CheckCircle2, Clock, XCircle } from "lucide-react"
import type { ApplicationStatus } from "../../types"

interface SubmissionLockedModalProps {
  isOpen: boolean
  onClose: () => void
  status: ApplicationStatus
  submittedDate: string
}

const STATUS_CONFIG = {
  approved: {
    label: "Approved",
    color: "#3b7a57",
    bgColor: "#eef7ee",
    icon: CheckCircle2,
  },
  denied: {
    label: "Denied",
    color: "#ef4444",
    bgColor: "#fee2e2",
    icon: XCircle,
  },
  in_review: {
    label: "In Review",
    color: "#3b82f6",
    bgColor: "#eff6ff",
    icon: Clock,
  },
  pending_review: {
    label: "Pending Review",
    color: "#f59e0b",
    bgColor: "#fffbeb",
    icon: Clock,
  },
} as const

export function SubmissionLockedModal({
  isOpen,
  onClose,
  status,
  submittedDate,
}: SubmissionLockedModalProps): JSX.Element | null {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose()
    }
    document.addEventListener("keydown", handleEscape)
    if (isOpen) document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending_review
  const StatusIcon = statusConfig.icon

  return (
    <>
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1050 }}
      />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div
            className="modal-content border-0 overflow-hidden"
            style={{ borderRadius: "16px" }}
          >
            {/* Green gradient header */}
            <div
              style={{
                background: "linear-gradient(135deg, #3b7a57 0%, #2d5a41 100%)",
                padding: "1.5rem",
                color: "white",
              }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <Lock size={20} />
                  <h5 className="mb-0 fw-bold">Submission Locked</h5>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    lineHeight: 1,
                  }}
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="modal-body p-4">
              {/* Lock icon centred */}
              <div className="text-center mb-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{
                    width: "72px",
                    height: "72px",
                    backgroundColor: "#eef7ee",
                  }}
                >
                  <Lock size={32} color="#3b7a57" />
                </div>
                <h5 className="fw-bold mb-1" style={{ color: "#2d5a41" }}>
                  Application Submitted &amp; Locked
                </h5>
                <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
                  Your responses have been recorded. Submitted applications are
                  read-only and cannot be edited.
                </p>
              </div>

              <hr style={{ borderColor: "#e2e8f0" }} />

              {/* Status row */}
              <div className="d-flex align-items-center justify-content-between py-2">
                <span className="text-muted small fw-semibold text-uppercase">
                  Current Status
                </span>
                <span
                  className="badge d-flex align-items-center gap-1 px-3 py-2"
                  style={{
                    backgroundColor: statusConfig.bgColor,
                    color: statusConfig.color,
                    borderRadius: "20px",
                    fontSize: "0.82rem",
                  }}
                >
                  <StatusIcon size={13} />
                  {statusConfig.label}
                </span>
              </div>

              {/* Submission date row */}
              <div className="d-flex align-items-center justify-content-between py-2">
                <span className="text-muted small fw-semibold text-uppercase">
                  Submitted On
                </span>
                <span
                  className="d-flex align-items-center gap-1 small fw-semibold"
                  style={{ color: "#374151" }}
                >
                  <Calendar size={14} />
                  {submittedDate}
                </span>
              </div>

              <hr style={{ borderColor: "#e2e8f0" }} />

              {/* Got it button */}
              <button
                type="button"
                className="btn w-100 text-white fw-semibold mt-2"
                onClick={onClose}
                style={{
                  backgroundColor: "#3b7a57",
                  border: "none",
                  borderRadius: "10px",
                  padding: "0.65rem",
                }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

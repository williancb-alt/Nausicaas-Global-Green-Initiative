import React, { JSX } from "react"
import { AlertCircle } from "lucide-react"

interface SupportFormProps {
  subject: string
  setSubject: (v: string) => void
  message: string
  setMessage: (v: string) => void
  isSubmitting: boolean
  error: string | null
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export function SupportForm({
  subject,
  setSubject,
  message,
  setMessage,
  isSubmitting,
  error,
  onSubmit,
  onClose,
}: SupportFormProps): JSX.Element {
  return (
    <div className="modal-body p-4">
      <p className="text-muted mb-4" style={{ fontSize: "0.95rem" }}>
        Please fill out the form below to send a message to our support team
        regarding your application.
      </p>

      {error && (
        <div
          className="alert alert-danger d-flex align-items-center gap-2 mb-4"
          style={{ borderRadius: "8px" }}
        >
          <AlertCircle size={18} />
          <span className="small">{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label
            htmlFor="supportSubject"
            className="form-label fw-semibold text-secondary small"
          >
            Subject
          </label>
          <input
            type="text"
            className="form-control"
            id="supportSubject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            required
            style={{ borderRadius: "8px" }}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="supportMessage"
            className="form-label fw-semibold text-secondary small"
          >
            Message
          </label>
          <textarea
            className="form-control"
            id="supportMessage"
            rows={5}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="How can we help you?"
            required
            style={{ borderRadius: "8px", resize: "none" }}
          ></textarea>
        </div>

        <div className="d-flex gap-2 justify-content-end">
          <button
            type="button"
            className="btn btn-light"
            onClick={onClose}
            disabled={isSubmitting}
            style={{ borderRadius: "8px" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn text-white"
            disabled={isSubmitting || !message.trim()}
            style={{ backgroundColor: "#3b7a57", borderRadius: "8px" }}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>
    </div>
  )
}

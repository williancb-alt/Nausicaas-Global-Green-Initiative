import { JSX } from "react"
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Eye,
  Mail,
  X,
  Send,
} from "lucide-react"
import type { SupportMessage } from "../../services/api/support"

export function MessageMeta({ msg }: { msg: SupportMessage }): JSX.Element {
  return (
    <div className="card-header bg-white border-0 py-3 px-4">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <span
            className={`badge py-2 px-3 rounded-pill ${
              msg.status === "Replied" ? "bg-success" : "bg-primary"
            }`}
          >
            {msg.status === "Replied" ? (
              <CheckCircle2 size={14} className="me-1" />
            ) : (
              <Clock size={14} className="me-1" />
            )}
            {msg.status}
          </span>
          <span className="text-muted small">ID: #{msg.id}</span>
        </div>
        <div className="text-muted small d-flex align-items-center">
          <Clock size={14} className="me-1" />
          {msg.created_at_str}
        </div>
      </div>
    </div>
  )
}

export function MessageContent({ msg }: { msg: SupportMessage }): JSX.Element {
  return (
    <>
      <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
        <AlertCircle size={20} className="text-muted" />
        {msg.subject}
      </h5>

      <div className="bg-light p-3 rounded-3 mb-4">
        <div className="d-flex align-items-center gap-2 mb-2 text-muted small">
          <User size={14} />
          <strong>{msg.user.email}</strong>
        </div>
        <p className="mb-0 text-dark" style={{ whiteSpace: "pre-wrap" }}>
          {msg.message}
        </p>
      </div>
    </>
  )
}

export function AdminResponseHistory({
  msg,
  viewingHistory,
  setViewingHistory,
}: {
  msg: SupportMessage
  viewingHistory: number | null
  setViewingHistory: (id: number | null) => void
}): JSX.Element | null {
  if (msg.status !== "Replied") return null

  if (viewingHistory !== msg.id) {
    return (
      <button
        className="btn btn-outline-success btn-sm d-flex align-items-center gap-2"
        onClick={() => setViewingHistory(msg.id)}
      >
        <Eye size={16} /> View Official Response
      </button>
    )
  }

  if (!msg.admin_response) return null

  return (
    <div className="bg-success bg-opacity-10 p-4 rounded border border-success border-opacity-25 mt-3 position-relative">
      <button
        className="btn btn-link link-success p-0 position-absolute end-0 top-0 mt-3 me-3"
        onClick={() => setViewingHistory(null)}
      >
        <X size={18} />
      </button>
      <div className="d-flex align-items-center gap-2 mb-2 text-success fw-bold">
        <Mail size={16} /> Official Response
      </div>
      <p className="mb-0 text-dark" style={{ whiteSpace: "pre-wrap" }}>
        {msg.admin_response}
      </p>
      <div className="text-muted small mt-2">Sent at {msg.answered_at_str}</div>
    </div>
  )
}

export function ReplyForm({
  msg,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  onSendReply,
  isSending,
}: {
  msg: SupportMessage
  replyingTo: number | null
  setReplyingTo: (id: number | null) => void
  replyContent: string
  setReplyContent: (c: string) => void
  onSendReply: (id: number) => Promise<void>
  isSending: boolean
}): JSX.Element | null {
  if (msg.status !== "Open") return null

  if (replyingTo !== msg.id) {
    return (
      <button
        className="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-pill"
        onClick={() => setReplyingTo(msg.id)}
      >
        <Mail size={18} /> Compose Response
      </button>
    )
  }

  return (
    <div className="mt-4 p-4 rounded-4 bg-light border">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0">Compose Official Response</h6>
        <button
          className="btn btn-link text-muted p-0"
          onClick={() => setReplyingTo(null)}
        >
          <X size={20} />
        </button>
      </div>
      <textarea
        className="form-control mb-3 border-0 shadow-sm"
        rows={5}
        placeholder="Type your official response here..."
        value={replyContent}
        onChange={e => setReplyContent(e.target.value)}
        style={{ borderRadius: "10px" }}
      />
      <div className="d-flex justify-content-between align-items-center">
        <p className="text-muted small mb-0">
          This message will be sent to <strong>{msg.user.email}</strong> from
          the official initiative email address.
        </p>
        <button
          className="btn btn-success px-4 rounded-pill d-flex align-items-center gap-2"
          onClick={() => void onSendReply(msg.id)}
          disabled={!replyContent.trim() || isSending}
        >
          {isSending ? (
            <div
              className="spinner-border spinner-border-sm"
              role="status"
            ></div>
          ) : (
            <Send size={18} />
          )}
          Send Reply
        </button>
      </div>
    </div>
  )
}

import { JSX, useEffect, useState } from "react"
import { api } from "../services/api"
import type { SupportMessage } from "../services/api/support"
import {
  MessageSquare,
  Mail,
  Clock,
  User,
  Search,
  AlertCircle,
  Send,
  CheckCircle2,
  X,
  Eye,
  Filter,
} from "lucide-react"
import { AxiosError } from "axios"

type FilterStatus = "all" | "pending" | "replied"

/**
 * Header component for the Support Messages Page.
 */
function SupportPageHeader(): JSX.Element {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        padding: "3rem 0",
        color: "white",
        marginBottom: "2rem",
      }}
    >
      <div className="container">
        <div className="d-flex align-items-center gap-3 mb-2">
          <div className="bg-primary bg-opacity-25 p-2 rounded">
            <MessageSquare className="text-primary" size={24} />
          </div>
          <span className="text-primary fw-semibold tracking-wider text-uppercase small">
            Admin Control Panel
          </span>
        </div>
        <h1 className="display-6 fw-bold mb-0">Support Requests</h1>
        <p className="lead opacity-75 mt-2">
          Manage, respond, and track support history officially.
        </p>
      </div>
    </div>
  )
}

/**
 * Stats cards for the Support Messages Page.
 */
function SupportStatsCards({
  pending,
  replied,
}: {
  pending: number
  replied: number
}): JSX.Element {
  return (
    <div
      className="card border-0 shadow-sm h-100"
      style={{ borderRadius: "16px" }}
    >
      <div className="card-body d-flex align-items-center justify-content-around py-3">
        <div className="text-center">
          <div className="h4 mb-0 fw-bold text-primary">{pending}</div>
          <small
            className="text-muted text-uppercase fw-semibold"
            style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}
          >
            New Tickets
          </small>
        </div>
        <div className="vr opacity-10"></div>
        <div className="text-center">
          <div className="h4 mb-0 fw-bold text-success">{replied}</div>
          <small
            className="text-muted text-uppercase fw-semibold"
            style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}
          >
            Total Replied
          </small>
        </div>
      </div>
    </div>
  )
}

/**
 * Filter and Search bar for the Support Messages Page.
 */
function SupportFilterBar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  stats,
}: {
  searchQuery: string
  setSearchQuery: (q: string) => void
  statusFilter: FilterStatus
  setStatusFilter: (s: FilterStatus) => void
  stats: { total: number; pending: number; replied: number }
}): JSX.Element {
  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: "16px" }}>
      <div className="card-body p-3">
        <div className="row g-3 align-items-center">
          <div className="col-md-6 border-end-sm">
            <div className="d-flex align-items-center bg-light rounded-3 px-3">
              <Search className="text-muted" size={18} />
              <input
                type="text"
                className="form-control border-0 bg-transparent shadow-none py-2"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex align-items-center gap-2 px-2 overflow-auto pb-1 pb-md-0">
              <Filter size={16} className="text-muted me-2 d-none d-sm-block" />
              <button
                onClick={() => setStatusFilter("all")}
                className={`btn btn-sm px-3 rounded-pill transition-all ${statusFilter === "all" ? "btn-dark" : "btn-light text-muted border-0"}`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`btn btn-sm px-3 rounded-pill transition-all ${statusFilter === "pending" ? "btn-primary" : "btn-light text-muted border-0"}`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setStatusFilter("replied")}
                className={`btn btn-sm px-3 rounded-pill transition-all ${statusFilter === "replied" ? "btn-success" : "btn-light text-muted border-0"}`}
              >
                Replied ({stats.replied})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Individual support message card with reply and history functionality.
 */
function SupportMessageCard({
  msg,
  replyingTo,
  setReplyingTo,
  viewingHistory,
  setViewingHistory,
  replyContent,
  setReplyContent,
  onSendReply,
  isSending,
}: {
  msg: SupportMessage
  replyingTo: number | null
  setReplyingTo: (id: number | null) => void
  viewingHistory: number | null
  setViewingHistory: (id: number | null) => void
  replyContent: string
  setReplyContent: (c: string) => void
  onSendReply: (id: number) => Promise<void>
  isSending: boolean
}): JSX.Element {
  const isReplying = replyingTo === msg.id
  const isViewing = viewingHistory === msg.id

  return (
    <div
      className="card border-0 shadow-sm overflow-hidden h-100"
      style={{
        borderRadius: "16px",
        borderLeft:
          msg.status === "Replied" ? "6px solid #10b981" : "6px solid #3b82f6",
      }}
    >
      <div className="card-header bg-white border-0 py-3 px-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                App #{msg.application_id}
              </span>
              {msg.status === "Replied" ? (
                <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill d-flex align-items-center gap-1">
                  <CheckCircle2 size={14} /> Replied
                </span>
              ) : (
                <span className="badge bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-pill d-flex align-items-center gap-1">
                  <Clock size={14} /> Pending
                </span>
              )}
            </div>
            <h2 className="h5 fw-bold mb-1">{msg.subject}</h2>
            <div className="d-flex align-items-center gap-3 text-muted small mt-2">
              <span className="d-flex align-items-center gap-1">
                <User size={14} /> {msg.user.email}
              </span>
              <span className="d-flex align-items-center gap-1">
                <Clock size={14} /> {msg.created_at_str}
              </span>
            </div>
          </div>
          <div className="d-flex gap-2">
            {msg.status !== "Replied" ? (
              <button
                onClick={() => {
                  if (replyingTo === msg.id) {
                    setReplyingTo(null)
                  } else {
                    setReplyingTo(msg.id)
                    setReplyContent("")
                  }
                }}
                className={`btn d-flex align-items-center gap-2 px-4 ${isReplying ? "btn-light border" : "btn-primary"}`}
                style={{ borderRadius: "10px" }}
              >
                {isReplying ? <X size={18} /> : <Mail size={18} />}
                {isReplying ? "Cancel" : "Official Reply"}
              </button>
            ) : (
              <button
                onClick={() => setViewingHistory(isViewing ? null : msg.id)}
                className={`btn d-flex align-items-center gap-2 px-4 ${isViewing ? "btn-light border" : "btn-outline-success border-success border-opacity-25"}`}
                style={{ borderRadius: "10px" }}
              >
                {isViewing ? <X size={18} /> : <Eye size={18} />}
                {isViewing ? "Hide History" : "View Sent Response"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card-body bg-light bg-opacity-50 p-4">
        <div className="mb-4">
          <label className="text-muted small fw-bold text-uppercase mb-2 d-block">
            User Message
          </label>
          <div
            className="bg-white p-4 rounded shadow-sm border"
            style={{
              whiteSpace: "pre-wrap",
              color: "#334155",
              lineHeight: "1.6",
            }}
          >
            {msg.message}
          </div>
        </div>

        {/* Sent History - Read Only */}
        {msg.status === "Replied" && isViewing && (
          <div className="mt-4 p-4 bg-white rounded shadow-sm border-top border-success border-4 slide-down">
            <label className="text-success small fw-bold text-uppercase mb-2 d-block d-flex align-items-center gap-2">
              <CheckCircle2 size={14} /> Official Response Profile
            </label>
            <p className="text-muted small mb-3">
              Sent to <strong>{msg.user.email}</strong> via secure gateway. This
              record is permanent and cannot be modified.
            </p>
            <div
              className="bg-success bg-opacity-10 p-4 rounded border border-success border-opacity-25"
              style={{
                whiteSpace: "pre-wrap",
                color: "#065f46",
                lineHeight: "1.6",
                fontStyle: "italic",
              }}
            >
              {msg.admin_response}
            </div>
          </div>
        )}

        {/* Inline Reply Form - Only for Open tickets */}
        {isReplying && (
          <div className="mt-4 p-4 bg-white rounded shadow-sm border-top border-primary border-4 slide-down">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Send size={16} className="text-primary" />
              Compose Official Response
            </h6>
            <p className="text-muted small mb-3">
              This message will be sent to <strong>{msg.user.email}</strong>{" "}
              from the official initiative email address.
            </p>
            <textarea
              className="form-control mb-3"
              rows={6}
              placeholder="Type your official response here..."
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              style={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
            ></textarea>
            <div className="d-flex justify-content-end">
              <button
                onClick={() => void onSendReply(msg.id)}
                disabled={isSending || !replyContent.trim()}
                className="btn btn-primary d-flex align-items-center gap-2 px-5 py-2"
                style={{ borderRadius: "10px" }}
              >
                {isSending ? (
                  <div
                    className="spinner-border spinner-border-sm"
                    role="status"
                  ></div>
                ) : (
                  <Send size={18} />
                )}
                {isSending ? "Sending..." : "Send Final Response"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function SupportMessagesPage(): JSX.Element {
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all")

  // States
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [viewingHistory, setViewingHistory] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const fetchMessages = async () => {
    try {
      const data = await api.support.getAllMessages()
      setMessages(data)
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const apiError = err as AxiosError<{ message?: string }>
        setError(
          apiError.response?.data?.message ||
            err.message ||
            "Failed to load messages.",
        )
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to load messages.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchMessages()
  }, [])

  const filteredMessages = messages.filter(m => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && m.status !== "Replied") ||
      (statusFilter === "replied" && m.status === "Replied")

    if (!matchesStatus) return false

    const query = searchQuery.toLowerCase()
    return (
      m.subject.toLowerCase().includes(query) ||
      m.user.email.toLowerCase().includes(query) ||
      m.message.toLowerCase().includes(query) ||
      (m.admin_response && m.admin_response.toLowerCase().includes(query))
    )
  })

  const stats = {
    total: messages.length,
    pending: messages.filter(m => m.status !== "Replied").length,
    replied: messages.filter(m => m.status === "Replied").length,
  }

  const handleSendReply = async (messageId: number) => {
    if (!replyContent.trim()) return
    setIsSending(true)
    setError(null)
    try {
      await api.support.replyToMessage(messageId, replyContent)
      setSuccessMsg("Official response sent successfully!")
      setReplyingTo(null)
      setReplyContent("")
      setTimeout(() => setSuccessMsg(null), 5000)
      void fetchMessages()
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const apiError = err as AxiosError<{ message?: string }>
        setError(
          apiError.response?.data?.message ||
            err.message ||
            "Failed to send reply.",
        )
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to send reply.")
      }
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div
      style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}
      className="pb-5"
    >
      <SupportPageHeader />

      <div className="container">
        {/* Alerts */}
        {successMsg && (
          <div
            className="alert alert-success border-0 shadow-sm d-flex align-items-center gap-2 mb-4"
            style={{ borderRadius: "12px" }}
          >
            <CheckCircle2 size={20} />
            {successMsg}
          </div>
        )}

        {error && (
          <div
            className="alert alert-danger border-0 shadow-sm d-flex align-items-center gap-2 mb-4"
            style={{ borderRadius: "12px" }}
          >
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Filters & Search */}
        <div className="row mb-5 g-4">
          <div className="col-12 col-xl-8">
            <SupportFilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              stats={stats}
            />
          </div>
          <div className="col-12 col-xl-4">
            <SupportStatsCards
              pending={stats.pending}
              replied={stats.replied}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div
            className="card border-0 shadow-sm text-center py-5"
            style={{ borderRadius: "16px" }}
          >
            <div className="card-body">
              <MessageSquare size={48} className="text-muted mb-3 opacity-25" />
              <h3 className="h5 text-muted">No matching messages found</h3>
              <p className="text-muted small">
                Try adjusting your filters or search query.
              </p>
              <button
                className="btn btn-link text-primary text-decoration-none"
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("all")
                }}
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {filteredMessages.map(msg => (
              <div key={msg.id} className="col-12">
                <SupportMessageCard
                  msg={msg}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  viewingHistory={viewingHistory}
                  setViewingHistory={setViewingHistory}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  onSendReply={handleSendReply}
                  isSending={isSending}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .transition-all { transition: all 0.2s ease-in-out; }
        .border-end-md { border-right: 1px solid #dee2e6; }
        @media (max-width: 767.98px) {
            .border-end-md { border-right: none; }
        }
        .slide-down {
            animation: slideDown 0.3s ease-out;
        }
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

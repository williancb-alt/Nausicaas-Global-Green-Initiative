import { JSX, useEffect, useState } from "react"
import { api } from "../services/api"
import type { SupportMessage } from "../services/api/support"
import {
    MessageSquare,
    Mail,
    Clock,
    User,
    Search,
    AlertCircle
} from "lucide-react"

export function SupportMessagesPage(): JSX.Element {
    const [messages, setMessages] = useState<SupportMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const data = await api.support.getAllMessages()
                setMessages(data)
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || "Failed to load messages.")
            } finally {
                setLoading(false)
            }
        }
        fetchMessages()
    }, [])

    const filteredMessages = messages.filter(m =>
        m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.message.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleReplyClient = (message: SupportMessage) => {
        const mailto = `mailto:${message.user.email}?subject=RE: ${encodeURIComponent(message.subject)}`
        window.location.href = mailto
    }

    return (
        <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }} className="pb-5">
            {/* Header */}
            <div
                style={{
                    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                    padding: "3rem 0",
                    color: "white",
                    marginBottom: "2rem"
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
                    <p className="lead opacity-75 mt-2">Manage and respond to user queries regarding their applications.</p>
                </div>
            </div>

            <div className="container">
                {/* Stats & Search */}
                <div className="row mb-4 g-3 align-items-center">
                    <div className="col-md-8">
                        <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
                            <div className="card-body p-2 d-flex align-items-center">
                                <Search className="ms-3 text-muted" size={20} />
                                <input
                                    type="text"
                                    className="form-control border-0 shadow-none"
                                    placeholder="Search by subject, email, or message content..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="d-flex gap-3 justify-content-md-end">
                            <div className="text-end">
                                <div className="text-muted small">Total Messages</div>
                                <div className="h4 mb-0 fw-bold">{messages.length}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger" style={{ borderRadius: "12px" }}>
                        <AlertCircle className="me-2" />
                        {error}
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="card border-0 shadow-sm text-center py-5" style={{ borderRadius: "16px" }}>
                        <div className="card-body">
                            <MessageSquare size={48} className="text-muted mb-3 opacity-25" />
                            <h3 className="h5 text-muted">No support messages found</h3>
                            <p className="text-muted small">Try adjusting your search or check back later.</p>
                        </div>
                    </div>
                ) : (
                    <div className="row g-4">
                        {filteredMessages.map((msg) => (
                            <div key={msg.id} className="col-12">
                                <div
                                    className="card border-0 shadow-sm overflow-hidden h-100 message-card"
                                    style={{ borderRadius: "16px", borderLeft: "4px solid #3b82f6" }}
                                >
                                    <div className="card-header bg-white border-0 py-3 px-4">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <span className="badge bg-primary bg-opacity-10 text-primary mb-2 px-3 py-2 rounded-pill">
                                                    Application #{msg.application_id}
                                                </span>
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
                                                <button
                                                    onClick={() => handleReplyClient(msg)}
                                                    className="btn btn-primary d-flex align-items-center gap-2 px-4"
                                                    style={{ borderRadius: "10px" }}
                                                >
                                                    <Mail size={18} />
                                                    Reply via Email
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-body bg-light bg-opacity-50 p-4">
                                        <div
                                            className="bg-white p-4 rounded shadow-sm border"
                                            style={{ whiteSpace: "pre-wrap", color: "#334155", lineHeight: "1.6" }}
                                        >
                                            {msg.message}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

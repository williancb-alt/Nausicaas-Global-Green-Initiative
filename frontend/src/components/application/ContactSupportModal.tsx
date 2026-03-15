import { JSX, useEffect, useState } from "react"
import { MessageSquare, Send, AlertCircle } from "lucide-react"
import { api } from "../../services/api"

interface ContactSupportModalProps {
    isOpen: boolean
    onClose: () => void
    applicationId: number | string
}

function ContactModalHeader({ onClose }: { onClose: () => void }): JSX.Element {
    return (
        <div
            style={{
                background: "linear-gradient(135deg, #3b7a57 0%, #2d5a41 100%)",
                padding: "1.5rem",
                color: "white",
            }}
        >
            <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                    <MessageSquare size={20} />
                    <h5 className="mb-0 fw-bold">Contact Support</h5>
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
    )
}

function ContactModalBody({
    applicationId,
    onClose,
}: {
    applicationId: number | string
    onClose: () => void
}): JSX.Element {
    const [subject, setSubject] = useState(`Question regarding Application #${applicationId}`)
    const [message, setMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            await api.support.createMessage({
                application_id: applicationId,
                subject,
                message,
            })
            setIsSubmitting(false)
            setIsSuccess(true)
            setTimeout(() => {
                onClose()
            }, 3000)
        } catch (err: any) {
            setIsSubmitting(false)
            setError(err.response?.data?.message || err.message || "Failed to send message.")
        }
    }

    if (isSuccess) {
        return (
            <div className="modal-body p-4 text-center">
                <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: "72px", height: "72px", backgroundColor: "#eef7ee" }}
                >
                    <Send size={32} color="#3b7a57" />
                </div>
                <h5 className="fw-bold mb-1" style={{ color: "#2d5a41" }}>Message Sent</h5>
                <p className="text-muted mb-0">
                    Our environmental program office has received your message and will get back to you shortly.
                </p>
            </div>
        )
    }

    return (
        <div className="modal-body p-4">
            <p className="text-muted mb-4" style={{ fontSize: "0.95rem" }}>
                Please fill out the form below to send a message to our support team regarding your application.
            </p>

            {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" style={{ borderRadius: "8px" }}>
                    <AlertCircle size={18} />
                    <span className="small">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="supportSubject" className="form-label fw-semibold text-secondary small">
                        Subject
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="supportSubject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        style={{ borderRadius: "8px" }}
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="supportMessage" className="form-label fw-semibold text-secondary small">
                        Message
                    </label>
                    <textarea
                        className="form-control"
                        id="supportMessage"
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
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

export function ContactSupportModal({
    isOpen,
    onClose,
    applicationId,
}: ContactSupportModalProps): JSX.Element | null {
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
                        <ContactModalHeader onClose={onClose} />
                        <ContactModalBody onClose={onClose} applicationId={applicationId} />
                    </div>
                </div>
            </div>
        </>
    )
}

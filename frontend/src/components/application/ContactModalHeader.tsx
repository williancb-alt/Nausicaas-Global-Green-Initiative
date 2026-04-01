import { JSX } from "react"
import { MessageSquare } from "lucide-react"

export function ContactModalHeader({
  onClose,
}: {
  onClose: () => void
}): JSX.Element {
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

import { JSX } from "react"
import { Send } from "lucide-react"

export function SuccessMessage(): JSX.Element {
  return (
    <div className="modal-body p-4 text-center">
      <div
        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
        style={{ width: "72px", height: "72px", backgroundColor: "#eef7ee" }}
      >
        <Send size={32} color="#3b7a57" />
      </div>
      <h5 className="fw-bold mb-1" style={{ color: "#2d5a41" }}>
        Message Sent
      </h5>
      <p className="text-muted mb-0">
        Our environmental program office has received your message and will get
        back to you shortly.
      </p>
    </div>
  )
}

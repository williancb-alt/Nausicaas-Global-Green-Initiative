import { JSX } from "react"
import { MessageSquare } from "lucide-react"

/**
 * Header component for the Support Messages Page.
 */
export function SupportPageHeader(): JSX.Element {
  return (
    <div className="d-flex align-items-center gap-3 mb-4">
      <div
        className="p-3 rounded-4 bg-success bg-opacity-10"
        style={{ border: "1px solid #3b7a57" }}
      >
        <MessageSquare size={32} className="text-success" />
      </div>
      <div>
        <h1 className="h2 mb-0 fw-bold" style={{ color: "#2f6f44" }}>
          Support Hub
        </h1>
        <p className="text-muted mb-0">
          Manage and respond to initiative member inquiries
        </p>
      </div>
    </div>
  )
}

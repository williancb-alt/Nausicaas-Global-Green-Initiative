import { ApplicationStatus } from "@/types"

const STATUS_STYLE: Record<
  ApplicationStatus,
  { backgroundColor: string; color: string }
> = {
  approved: { backgroundColor: "#eef7ee", color: "#2f6f44" },
  denied: { backgroundColor: "#fee2e2", color: "#dc2626" },
  pending_review: { backgroundColor: "#fff4e6", color: "#d97706" },
  in_review: { backgroundColor: "#fff4e6", color: "#d97706" },
}

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  approved: "Approved",
  denied: "Denied",
  pending_review: "Pending Review",
  in_review: "In Review",
}

interface StatusBadgeProps {
  status: ApplicationStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLE[status]
  const label = STATUS_LABEL[status]
  return (
    <span
      className="badge"
      style={{
        ...style,
        padding: "0.5rem 0.75rem",
      }}
    >
      {label}
    </span>
  )
}

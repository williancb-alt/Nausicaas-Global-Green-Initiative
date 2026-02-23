import { CheckCircle2, Clock, XCircle } from "lucide-react"
import type { ApplicationStatus } from "../../types"

export const STATUS_CONFIG: Record<
  ApplicationStatus,
  {
    headerBadgeClass: string
    headerLabel: string
    buttonVariant: "success" | "danger" | "secondary"
    buttonLabel: string
  }
> = {
  approved: {
    headerBadgeClass: "badge bg-success",
    headerLabel: "✓ Approved",
    buttonVariant: "success",
    buttonLabel: "✓ Application Approved",
  },
  denied: {
    headerBadgeClass: "badge bg-danger",
    headerLabel: "✗ Denied",
    buttonVariant: "danger",
    buttonLabel: "✗ Application Denied",
  },
  in_review: {
    headerBadgeClass: "badge bg-info",
    headerLabel: "In Review",
    buttonVariant: "secondary",
    buttonLabel: "Application Submitted",
  },
  pending_review: {
    headerBadgeClass: "badge bg-warning text-dark",
    headerLabel: "Pending Review",
    buttonVariant: "secondary",
    buttonLabel: "Application Submitted",
  },
}

export const LIST_STATUS_CONFIG = {
  approved: { label: "Approved", color: "success", icon: CheckCircle2 },
  denied: { label: "Denied", color: "danger", icon: XCircle },
  pending_review: { label: "Pending Review", color: "warning", icon: Clock },
  in_review: { label: "In Review", color: "info", icon: Clock },
} as const

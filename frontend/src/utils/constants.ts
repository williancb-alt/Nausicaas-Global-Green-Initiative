import { clsx, type ClassValue } from "clsx"
import type { ApplicationStatus } from "../types"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const BUTTON_TEXT = {
  LOGIN: "Sign In",
  LOGGING_IN: "Logging in...",
  LOGOUT: "Logout",
  LOGGING_OUT: "Logging out...",
  CREATE_GRANT: "Create Grant",
  CREATING: "Creating...",
  REFRESH: "Refresh",
  LOADING: "Loading...",
  SIGN_UP: "Sign Up",
  SIGNING_UP: "Signing up...",
  SEND_RESET_LINK: "Send Reset Link",
  SENDING_RESET_LINK: "Sending...",
  RESET_PASSWORD: "Reset Password",
  RESETTING_PASSWORD: "Resetting...",
} as const

export const MESSAGES = {
  LOADING_GRANTS: "Loading grants...",
  NO_GRANTS_LOADED: "No grants loaded.",
} as const

export const GRANT_FORM_FIELDS = {
  NAME: "name",
  DEADLINE: "deadline",
  DESCRIPTION: "description",
} as const

export const AWARD_FORM_FIELDS = {
  NAME: "name",
  DEADLINE: "deadline",
  DESCRIPTION: "description",
} as const

export const GRANT_MANAGEMENT_STYLES = {
  pageBg: { backgroundColor: "#eef7ee", minHeight: "100vh" },
  header: { color: "#2f6f44", fontWeight: "700" },
  badge: { backgroundColor: "#3b7a57", color: "white", fontSize: "0.95rem" },
  card: { borderColor: "#3b7a57", borderWidth: "2px" },
  cardHeader: { backgroundColor: "#eef7ee", borderColor: "#3b7a57" },
  input: { borderColor: "#3b7a57" },
  btnPrimary: { backgroundColor: "#3b7a57", color: "white" },
} as const

export const AWARD_MANAGEMENT_STYLES = {
  pageBg: { backgroundColor: "#eef7ee", minHeight: "100vh" },
  header: { color: "#2f6f44", fontWeight: "700" },
  badge: { backgroundColor: "#3b7a57", color: "white", fontSize: "0.95rem" },
  card: { borderColor: "#3b7a57", borderWidth: "2px" },
  cardHeader: { backgroundColor: "#eef7ee", borderColor: "#3b7a57" },
  input: { borderColor: "#3b7a57" },
  btnPrimary: { backgroundColor: "#3b7a57", color: "white" },
} as const

export const GRANT_MESSAGES = {
  deleteConfirm: (name: string) =>
    `Are you sure you want to delete the grant "${name}"? This action cannot be undone.`,
  toggleError: (message: string) => `Failed to toggle visibility: ${message}`,
  saveError: (message: string) => `Failed to save changes: ${message}`,
  noGrants: "No grants created yet. Create one above to get started.",
  loadingGrants: "Loading grants...",
}

export const AWARD_MESSAGES = {
  deleteConfirm: (name: string) =>
    `Are you sure you want to delete the award "${name}"? This action cannot be undone.`,
  toggleError: (message: string) => `Failed to toggle visibility: ${message}`,
  saveError: (message: string) => `Failed to save changes: ${message}`,
  noAwards: "No awards created yet. Create one above to get started.",
  loadingAwards: "Loading awards...",
}

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

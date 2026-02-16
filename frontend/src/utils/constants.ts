import { clsx, type ClassValue } from "clsx"
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

export const GRANT_MANAGEMENT_STYLES = {
  pageBg: { backgroundColor: "#eef7ee", minHeight: "100vh" },
  header: { color: "#2f6f44", fontWeight: "700" },
  badge: { backgroundColor: "#3b7a57", color: "white", fontSize: "0.95rem" },
  card: { borderColor: "#3b7a57", borderWidth: "2px" },
  cardHeader: { backgroundColor: "#eef7ee", borderColor: "#3b7a57" },
  input: { borderColor: "#3b7a57" },
  btnPrimary: { backgroundColor: "#3b7a57", color: "white" },
} as const

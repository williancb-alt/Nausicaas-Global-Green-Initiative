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

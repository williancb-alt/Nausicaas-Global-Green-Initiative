import { authApi } from "./auth"
import { grantsApi } from "./grants"
import { awardsApi } from "./awards"
import { applications } from "./applications"
import { auditApi } from "./audit"

export const api = {
  auth: authApi,
  awards: awardsApi,
  grants: grantsApi,
  applications,
  audit: auditApi,
}

export * from "./client"

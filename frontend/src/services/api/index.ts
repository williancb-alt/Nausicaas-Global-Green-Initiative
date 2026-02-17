import { authApi } from "./auth"
import { grantsApi } from "./grants"
import { applications } from "./applications"
import { auditApi } from "./audit"

export const api = {
  auth: authApi,
  grants: grantsApi,
  applications,
  audit: auditApi,
}

export * from "./client"

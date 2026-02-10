import { authApi } from "./auth"
import { grantsApi } from "./grants"
import { auditApi } from "./audit"

export const api = {
  auth: authApi,
  grants: grantsApi,
  audit: auditApi,
}

export * from "./client"

import { authApi } from "./auth"
import { grantsApi } from "./grants"
import { awardsApi } from "./awards"
import { applications } from "./applications"
import { auditApi } from "./audit"
import { supportApi } from "./support"

export const api = {
  auth: authApi,
  awards: awardsApi,
  grants: grantsApi,
  applications,
  audit: auditApi,
  support: supportApi,
}

export * from "./client"

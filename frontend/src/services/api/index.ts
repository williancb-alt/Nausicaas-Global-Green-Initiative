import { authApi } from "./auth"
import { grantsApi } from "./grants"
import { applications } from "./applications"

export const api = {
  auth: authApi,
  grants: grantsApi,
  applications,
}

export * from "./client"

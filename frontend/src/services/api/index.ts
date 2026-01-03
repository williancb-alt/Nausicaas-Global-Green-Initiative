import { authApi } from "./auth"
import { grantsApi } from "./grants"

export const api = {
  auth: authApi,
  grants: grantsApi,
}

export * from "./client"

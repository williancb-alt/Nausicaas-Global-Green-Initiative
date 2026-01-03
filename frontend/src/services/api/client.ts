import axios, { type AxiosError } from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "")
if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL environment variable is required")
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
})

apiClient.interceptors.request.use(
  config => config,
  error =>
    Promise.reject(error instanceof Error ? error : new Error(String(error))),
)

apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      `HTTP error ${error.response?.status || "unknown"}`
    throw new Error(message)
  },
)

export interface BaseResponse {
  status: string
  message: string
}

export interface AuthSuccess extends BaseResponse {
  token_type: string
  expires_in: number
}

export interface UserInfo {
  email: string
  admin: boolean
  public_id?: string
  token_expires_in?: string
}

export interface Grant {
  name: string
  info_url?: string | null
  created_at_iso8601?: string
  created_at_rfc822?: string
  deadline: string
  deadline_passed: boolean
  time_remaining: string
  owner?: { email: string; public_id: string }
  link?: string
}

export interface GrantPage {
  links: {
    self: string
    prev?: string
    next?: string
    first: string
    last: string
  }
  has_prev: boolean
  has_next: boolean
  page: number
  total_pages: number
  items_per_page: number
  total_items: number
  items: Grant[]
}

import { getMonitoring } from "../monitoring"
import { parseErrorMessage } from "./errorParser"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "")
if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL environment variable is required")
}

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function buildErrorMessage(response: Response): Promise<string> {
  const fallback = `HTTP error ${response.status}`
  const text = await response.text()
  if (!text) return fallback
  const body = tryParseJson(text)
  return body ? parseErrorMessage(body, fallback) : fallback
}

async function handleResponse<T>(response: Response): Promise<T> {
  const monitoring = getMonitoring()

  if (response.ok) {
    monitoring.addBreadcrumb({
      category: "http",
      message: `${response.status} ${response.url}`,
      level: "info",
      data: { status: response.status, url: response.url },
    })
    if (response.status === 204) return undefined as T
    return response.json() as Promise<T>
  }

  const errorMessage = await buildErrorMessage(response)
  const error = new Error(errorMessage)

  monitoring.addBreadcrumb({
    category: "http",
    message: `${response.status} ${response.url}`,
    level: "error",
    data: { status: response.status, url: response.url },
  })
  monitoring.captureException(error, {
    httpStatus: response.status,
    url: response.url,
  })

  throw error
}

type RequestOptions = {
  params?: Record<string, string | number>
  headers?: Record<string, string>
}

function buildUrl(
  path: string,
  params?: Record<string, string | number>,
): string {
  const url = `${API_BASE_URL}${path}`
  if (!params) return url
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    searchParams.append(key, String(value))
  }
  const qs = searchParams.toString()
  return qs ? `${url}?${qs}` : url
}

function buildFetchInit(
  method: string,
  body?: BodyInit | Record<string, unknown> | null,
  options?: RequestOptions,
): RequestInit {
  const headers: Record<string, string> = {
    ...options?.headers,
  }

  let fetchBody: BodyInit | null = null

  if (body instanceof URLSearchParams) {
    headers["Content-Type"] = "application/x-www-form-urlencoded"
    fetchBody = body.toString()
  } else if (body !== null && body !== undefined) {
    headers["Content-Type"] = "application/json"
    fetchBody = JSON.stringify(body)
  }

  const init: RequestInit = {
    method,
    headers,
    credentials: "include",
  }
  if (fetchBody) init.body = fetchBody
  return init
}

export const apiClient = {
  async get<T>(path: string, options?: RequestOptions): Promise<{ data: T }> {
    const url = buildUrl(path, options?.params)
    const response = await fetch(url, buildFetchInit("GET", null, options))
    const data = await handleResponse<T>(response)
    return { data }
  },

  async post<T>(
    path: string,
    body?: URLSearchParams | Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<{ data: T }> {
    const url = buildUrl(path)
    const response = await fetch(url, buildFetchInit("POST", body, options))
    const data = await handleResponse<T>(response)
    return { data }
  },

  async put<T>(
    path: string,
    body?: URLSearchParams | Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<{ data: T }> {
    const url = buildUrl(path)
    const response = await fetch(url, buildFetchInit("PUT", body, options))
    const data = await handleResponse<T>(response)
    return { data }
  },

  async delete(path: string, options?: RequestOptions): Promise<void> {
    const url = buildUrl(path)
    const response = await fetch(url, buildFetchInit("DELETE", null, options))
    if (!response.ok) {
      await handleResponse(response)
    }
  },
}

export type {
  BaseResponse,
  AuthSuccess,
  UserInfo,
  Grant,
  GrantPage,
  Award,
  AwardPage,
} from "./types"

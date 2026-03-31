import { parseErrorMessage } from "./errorParser"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "")
if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL environment variable is required")
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) return undefined as T
    return response.json() as Promise<T>
  }

  const fallback = `HTTP error ${response.status}`
  try {
    const body: unknown = await response.json()
    throw new Error(parseErrorMessage(body, fallback))
  } catch (e) {
    if (e instanceof Error) throw e
    throw new Error(fallback)
  }
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
  return `${url}?${searchParams.toString()}`
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

  return {
    method,
    headers,
    credentials: "include",
    body: fetchBody,
  }
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

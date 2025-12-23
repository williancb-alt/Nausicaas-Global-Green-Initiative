const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "")
if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL environment variable is required")
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

interface RequestOptions {
  method?: HttpMethod
  token?: string
  body?: URLSearchParams | object
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", token, body } = options
  const isForm = body instanceof URLSearchParams
  const headers: Record<string, string> = {}

  if (token) headers.Authorization = `Bearer ${token}`
  if (body && isForm)
    headers["Content-Type"] = "application/x-www-form-urlencoded"
  if (body && !isForm) headers["Content-Type"] = "application/json"

  const payload: BodyInit | null =
    body === undefined ? null : isForm ? body : JSON.stringify(body)

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: payload,
  })

  if (!response.ok) {
    let message = `HTTP error ${response.status}`
    try {
      const err = (await response.json()) as {
        message?: string
        error?: string
      }
      message = err.message || err.error || message
    } catch {
      /* ignore */
      // TODO - update error handling
    }
    throw new Error(message)
  }

  const text = await response.text()
  return text ? (JSON.parse(text) as T) : (undefined as T)
}

export interface AuthSuccess {
  status: string
  message: string
  access_token: string
  token_type: string
  expires_in: number
}

export interface UserInfo {
  email: string
  admin: boolean
  public_id?: string
  token_expires_in?: string
}

export interface GrantOwner {
  email: string
  public_id: string
}

export interface Grant {
  name: string
  info_url?: string | null
  created_at_iso8601?: string
  created_at_rfc822?: string
  deadline: string
  deadline_passed: boolean
  time_remaining: string
  owner?: GrantOwner
  link?: string
}

export interface PaginationLinks {
  self: string
  prev?: string
  next?: string
  first: string
  last: string
}

export interface GrantPage {
  links: PaginationLinks
  has_prev: boolean
  has_next: boolean
  page: number
  total_pages: number
  items_per_page: number
  total_items: number
  items: Grant[]
}

export const api = {
  register: async (email: string, password: string): Promise<AuthSuccess> => {
    const body = new URLSearchParams({ email, password })
    return request<AuthSuccess>("/api/v1/auth/register", {
      method: "POST",
      body,
    })
  },

  login: async (email: string, password: string): Promise<AuthSuccess> => {
    const body = new URLSearchParams({ email, password })
    return request<AuthSuccess>("/api/v1/auth/login", { method: "POST", body })
  },

  getUser: async (token: string): Promise<UserInfo> => {
    return request<UserInfo>("/api/v1/auth/user", { token })
  },

  logout: async (
    token: string,
  ): Promise<{ status: string; message: string }> => {
    return request("/api/v1/auth/logout", { method: "POST", token })
  },

  createGrant: async (
    token: string,
    params: { name: string; deadline: string },
  ): Promise<{ status: string; message: string }> => {
    const body = new URLSearchParams({
      name: params.name,
      deadline: params.deadline,
    })
    return request("/api/v1/grants", { method: "POST", token, body })
  },

  listGrants: async (
    token: string,
    page = 1,
    perPage = 10,
  ): Promise<GrantPage> => {
    return request<GrantPage>(
      `/api/v1/grants?page=${page}&per_page=${perPage}`,
      { token },
    )
  },

  getGrant: async (token: string, name: string): Promise<Grant> => {
    return request<Grant>(`/api/v1/grants/${encodeURIComponent(name)}`, {
      token,
    })
  },

  updateGrant: async (
    token: string,
    name: string,
    data: { deadline: string },
  ): Promise<{ status: string; message: string } | Grant> => {
    const body = new URLSearchParams({ deadline: data.deadline })
    return request(`/api/v1/grants/${encodeURIComponent(name)}`, {
      method: "PUT",
      token,
      body,
    })
  },

  deleteGrant: async (token: string, name: string): Promise<void> => {
    await request<void>(`/api/v1/grants/${encodeURIComponent(name)}`, {
      method: "DELETE",
      token,
    })
  },
}

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
  description?: string
  custom_fields?: {
    configs: Array<
      | { type: "text"; label: string; maxLength: number; required: boolean }
      | { type: "radio"; label: string; options: string[]; required: boolean }
      | { type: "phone"; label: string; required: boolean }
      | { type: "email"; label: string; required: boolean }
      | {
          type: "currency"
          label: string
          min: number
          max: number
          required: boolean
        }
    >
    values: Record<string, string>
  }
  hidden?: boolean
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

export interface Award {
  name: string
  info_url?: string | null
  created_at_iso8601?: string
  created_at_rfc822?: string
  deadline: string
  deadline_passed: boolean
  time_remaining: string
  description?: string
  hidden?: boolean
  owner?: { email: string; public_id: string }
  link?: string
}

export interface AwardPage {
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
  items: Award[]
}

export type LoginCredentials = {
  email: string
  password: string
}

// Dynamic field types
export interface TextFieldConfig {
  type: "text"
  label: string
  maxLength: number
}

export interface RadioFieldConfig {
  type: "radio"
  label: string
  options: string[]
}

export interface PhoneFieldConfig {
  type: "phone"
  label: string
}

export interface EmailFieldConfig {
  type: "email"
  label: string
}

export type DynamicFieldConfig =
  | TextFieldConfig
  | RadioFieldConfig
  | PhoneFieldConfig
  | EmailFieldConfig

export interface CustomFields {
  configs: DynamicFieldConfig[]
  values: Record<string, string>
}

export type CreateGrantParams = {
  name: string
  deadline: string
  description: string
  custom_fields?: string // JSON string
}

export type UpdateGrantParams = {
  name: string
  deadline?: string
  description?: string
  custom_fields?: string // JSON string
  hidden?: boolean
}

export type ApplicationStatus =
  | "pending_review"
  | "in_review"
  | "approved"
  | "denied"

export interface ApplicationApplicant {
  email: string
  public_id: string
}

export interface ApplicationGrant {
  name: string
  description?: string
  custom_fields?: {
    configs: DynamicFieldConfig[]
  }
}

export interface Application {
  id: number
  submitted_at: string
  submitted_date: string
  status: ApplicationStatus
  field_values?: Record<string, string>
  feedback?: string
  applicant: ApplicationApplicant
  grant: ApplicationGrant
}

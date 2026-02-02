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
  deadline: string
  description: string
  custom_fields?: string // JSON string
}

export type ApplicationStatus =
  | "pending_review"
  | "in_review"
  | "approved"
  | "denied";

export interface Application {
  id: string;
  userId: string;
  grantId: string;
  grantTitle: string;
  submittedDate: string;
  status: ApplicationStatus;
  fullName: string;
  organization: string;
  email: string;
  projectTitle: string;
  projectPurpose: string;
  requestedAmount: number;
  projectDescription: string;
  documents: string[];
  feedback?: string;
}
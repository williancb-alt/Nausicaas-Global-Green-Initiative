variable "location" { type = string }

variable "backend_hostname" { type = string }
variable "frontend_url" { type = string }


variable "node_resource_group" {
  type = string
}

variable "namespace" {
  type = string
}

variable "tls_secret_name" {
  type = string
}

variable "ingress_public_ip_name" {
  type = string
}

variable "create_namespace" {
  type    = bool
  default = true
}

variable "backend_image_ref" {
  type = string
}

variable "key_vault_name" {
  type = string
}

variable "key_vault_tenant_id" {
  type      = string
  sensitive = true
}

variable "key_vault_kubelet_identity_client_id" {
  type      = string
  sensitive = true
}

variable "environment" {
  description = "Deployment environment (e.g. staging, production)"
  type        = string
}

variable "seed_password" {
  description = "Password for seeded users (non-production only)"
  type        = string
  sensitive   = true
}

variable "sentry_api_dsn" {
  description = "Sentry DSN for backend error monitoring"
  type        = string
  default     = ""
  sensitive   = true
}
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

variable "rate_limit_rps" {
  description = "General API rate limit in requests per second per IP address"
  type        = string
  default     = "20"
}

variable "rate_limit_burst_multiplier" {
  description = "Burst multiplier general API rate limit"
  type        = string
  default     = "5"
}

variable "auth_rate_limit_rps" {
  description = "Auth endpoint rate limit in requests per second per IP address"
  type        = string
  default     = "5"
}

variable "auth_rate_limit_burst_multiplier" {
  description = "Burst multiplier auth endpoints rate limit"
  type        = string
  default     = "3"
}

variable "auth_rate_limited_paths" {
  description = "Unauthenticated auth endpoint paths to rate limit"
  type        = list(string)
  default = [
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/api/v1/auth/forgot-password",
    "/api/v1/auth/reset-password",
  ]
}

variable "backend_hostname" {
  type = string
}

variable "frontend_url" {
  type = string
}

variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}

variable "cloudflare_zone_name" {
  type    = string
  default = "nausicaaglobalgreeninitiative.ie"
}

variable "backend_image_ref" {
  type    = string
  default = ""

  validation {
    condition     = length(trim(var.backend_image_ref, " \t\r\n")) > 0
    error_message = "backend_image_ref must be a non-empty image reference (tag or digest)."
  }
}

variable "frontend_hostname" {
  type = string
}

variable "frontend_image_ref" {
  type    = string
  default = ""

  validation {
    condition     = length(trim(var.frontend_image_ref, " \t\r\n")) > 0
    error_message = "frontend_image_ref must be a non-empty image reference (tag or digest)."
  }
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "seed_password" {
  description = "Password for seeded users (unused in production)"
  type        = string
  sensitive   = true
  default     = ""
}
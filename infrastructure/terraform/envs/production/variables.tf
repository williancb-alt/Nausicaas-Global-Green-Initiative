variable "backend_hostname" {
  type = string
}

variable "backend_image_tag" {
  type    = string
  default = "latest"
}

variable "frontend_url" {
  type = string
}

variable "db_admin_username" {
  type = string
}

variable "db_admin_password" {
  type      = string
  sensitive = true
}

variable "db_name" {
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
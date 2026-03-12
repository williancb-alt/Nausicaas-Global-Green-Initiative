variable "backend_hostname" {
  type = string
}

variable "backend_image_tag" {
  type    = string
  default = "staging"
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
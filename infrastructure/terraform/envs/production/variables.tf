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
}

variable "frontend_hostname" {
  type = string
}

variable "frontend_image_ref" {
  type    = string
  default = ""
}
variable "acme_email" {
  type = string
}

variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}

variable "issuer_name" {
  type    = string
  default = "letsencrypt-prod"
}

variable "acme_server_url" {
  type    = string
  default = "https://acme-staging-v02.api.letsencrypt.org/directory"
}
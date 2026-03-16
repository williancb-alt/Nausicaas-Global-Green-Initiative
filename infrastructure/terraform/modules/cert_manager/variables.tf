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

variable "wildcard_enabled" {
  type    = bool
  default = false
}

variable "wildcard_dns_name" {
  type    = string
  default = "*.nausicaaglobalgreeninitiative.ie"
}

variable "wildcard_secret_name" {
  type    = string
  default = "nausicaa-wildcard-tls"
}

variable "wildcard_namespace" {
  type    = string
  default = "production"
}

variable "permanent_key_vault_name" {
  type    = string
  default = ""
}

variable "azure_tenant_id" {
  type    = string
  default = ""
}
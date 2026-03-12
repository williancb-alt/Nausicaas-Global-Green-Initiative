variable "location" { type = string }
variable "rg_name" { type = string }
variable "acr_name" { type = string }
variable "aks_name" { type = string }
variable "dns_prefix" { type = string }
variable "aks_node_count" { type = number }
variable "aks_node_size" { type = string }
variable "acme_email" {
  type = string
}
variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}
variable "acme_server_url" {
  type = string
}
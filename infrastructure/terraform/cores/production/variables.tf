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
variable "db_name" { type = string }
variable "db_admin_username" { type = string }
variable "db_admin_password" {
  type      = string
  sensitive = true
}
variable "db_server_name" {
  type = string
}
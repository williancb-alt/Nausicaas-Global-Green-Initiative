variable "location" { type = string }
variable "rg_name" { type = string }
variable "aks_name" { type = string }
variable "dns_prefix" { type = string }
variable "aks_node_count" { type = number }
variable "aks_node_size" { type = string }
variable "db_server_name" { type = string }
variable "db_name" { type = string }
variable "db_admin_username" { type = string }
variable "db_sku_name" {
  type    = string
  default = "B_Standard_B1ms"
}
variable "db_admin_password" {
  type      = string
  sensitive = true
}
variable "acs_email_connection_string" {
  type      = string
  sensitive = true
}

variable "acs_email_sender" {
  type      = string
  sensitive = true
}

variable "google_client_id" {
  type      = string
  sensitive = true
}

variable "google_client_secret" {
  type      = string
  sensitive = true
}

variable "github_client_id" {
  type      = string
  sensitive = true
}

variable "github_client_secret" {
  type      = string
  sensitive = true
}

variable "key_vault_name" {
  type        = string
  description = "Globally unique name for the Key Vault (3-24 alphanumeric and hyphens)."
}

variable "permanent_acr_name" {
  type = string
}

variable "permanent_acr_id" {
  type = string
}

variable "permanent_rg_name" {
  type = string
}

variable "permanent_key_vault_name" {
  type = string
}

variable "permanent_key_vault_id" {
  type = string
}
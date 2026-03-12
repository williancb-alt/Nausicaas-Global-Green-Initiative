variable "resource_group_name" { type = string }
variable "location"           { type = string }

variable "acr_login_server"   { type = string }

variable "backend_hostname"   { type = string }
variable "backend_image_tag"  { type = string }
variable "frontend_url"       { type = string }

variable "db_name"            { type = string }
variable "db_admin_username"  { type = string }

variable "node_resource_group" {
  type = string
}

variable "db_subnet_id" {
  type = string
}

variable "postgres_private_dns_zone_id" {
  type = string
}
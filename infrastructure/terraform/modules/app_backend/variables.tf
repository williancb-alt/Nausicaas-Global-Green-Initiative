variable "resource_group_name" { type = string }
variable "location" { type = string }

variable "acr_login_server" { type = string }

variable "backend_hostname" { type = string }
variable "backend_image_tag" { type = string }
variable "frontend_url" { type = string }


variable "node_resource_group" {
  type = string
}

variable "namespace" {
  type = string
}

variable "tls_secret_name" {
  type = string
}

variable "ingress_public_ip_name" {
  type = string
}

variable "database_url" {
  type = string
}
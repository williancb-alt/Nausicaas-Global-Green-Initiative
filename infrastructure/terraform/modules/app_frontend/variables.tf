variable "frontend_hostname" { type = string }
variable "frontend_image_ref" { type = string }
variable "backend_hostname" { type = string }

variable "namespace" {
  type = string
}

variable "tls_secret_name" {
  type = string
}
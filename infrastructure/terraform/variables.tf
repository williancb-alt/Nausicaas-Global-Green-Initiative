#identifiers

variable "location" {
  type    = string
  default = "northeurope"
}

variable "resource_group_name" {
  type    = string
  default = "nausicaas-rg"
}

variable "acr_name" {
  type = string
}

variable "aks_name" {
  type    = string
  default = "nausicaas-aks"
}

variable "aks_dns_prefix" {
  type    = string
  default = "nausicaas"
}

variable "aks_node_count" {
  type    = number
  default = 1
}

variable "aks_vm_size" {
  type    = string
  default = "Standard_B2s_v2"
}

variable "enable_acr_role_assignment" {
  type    = bool
  default = false
}
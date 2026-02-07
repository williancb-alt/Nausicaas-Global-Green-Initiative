#identifiers

variable "location" {
  type    = string
  default = "northeurope"
}

variable "acr_name" {
  type = string
}

variable "resource_group_name" {
  type    = string
  default = "nausicaas-rg"
}
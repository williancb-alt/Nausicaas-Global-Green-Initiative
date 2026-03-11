variable "aks_name" {
  type    = string
  default = "nausicaas-aks"
}

variable "aks_node_count" {
  type    = number
  default = 1
}

variable "aks_node_size" {
  type    = string
  default = "Standard_D2s_v3"
}

variable "dns_prefix" {
  type    = string
  default = "nausicaas"
}
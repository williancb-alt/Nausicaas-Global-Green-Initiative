output "namespace" {
  value = local.namespace_name
}

output "ingress_public_ip" {
  value = azurerm_public_ip.ingress.ip_address
}
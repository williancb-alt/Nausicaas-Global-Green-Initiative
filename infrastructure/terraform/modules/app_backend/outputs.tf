output "namespace" {
  value = kubernetes_namespace.app.metadata[0].name
}

output "ingress_public_ip" {
  value = azurerm_public_ip.ingress.ip_address
}
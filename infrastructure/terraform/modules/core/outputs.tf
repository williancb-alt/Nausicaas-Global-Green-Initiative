output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "location" {
  value = azurerm_resource_group.main.location
}

output "aks_name" {
  value = azurerm_kubernetes_cluster.aks.name
}

output "acr_login_server" {
  value = azurerm_container_registry.acr.login_server
}

output "kube_host" {
  value = azurerm_kubernetes_cluster.aks.kube_config[0].host
}

output "kube_client_certificate" {
  value     = azurerm_kubernetes_cluster.aks.kube_config[0].client_certificate
  sensitive = true
}

output "kube_client_key" {
  value     = azurerm_kubernetes_cluster.aks.kube_config[0].client_key
  sensitive = true
}

output "kube_cluster_ca_certificate" {
  value     = azurerm_kubernetes_cluster.aks.kube_config[0].cluster_ca_certificate
  sensitive = true
}

output "db_subnet_id" {
  value = azurerm_subnet.db.id
}

output "postgres_private_dns_zone_id" {
  value = azurerm_private_dns_zone.postgres.id
}

output "database_host" {
  value = azurerm_postgresql_flexible_server.main.fqdn
}

output "database_name" {
  value = var.db_name
}

output "database_user" {
  value = var.db_admin_username
}

output "key_vault_name" {
  value = azurerm_key_vault.main.name
}

output "key_vault_tenant_id" {
  value     = data.azurerm_client_config.current.tenant_id
  sensitive = true
}
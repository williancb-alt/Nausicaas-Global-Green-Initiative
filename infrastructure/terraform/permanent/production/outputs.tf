output "resource_group_name" {
  value = azurerm_resource_group.permanent.name
}

output "location" {
  value = azurerm_resource_group.permanent.location
}

output "key_vault_name" {
  value = azurerm_key_vault.permanent.name
}

output "key_vault_id" {
  value = azurerm_key_vault.permanent.id
}

output "key_vault_tenant_id" {
  value     = data.azurerm_client_config.current.tenant_id
  sensitive = true
}

output "acr_name" {
  value = azurerm_container_registry.permanent.name
}

output "acr_id" {
  value = azurerm_container_registry.permanent.id
}

output "acr_login_server" {
  value = azurerm_container_registry.permanent.login_server
}
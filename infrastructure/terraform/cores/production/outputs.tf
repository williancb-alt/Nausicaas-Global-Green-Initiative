output "resource_group_name" {
  value = module.core.resource_group_name
}

output "location" {
  value = module.core.location
}

output "aks_name" {
  value = module.core.aks_name
}

output "acr_login_server" {
  value = module.core.acr_login_server
}

output "db_subnet_id" {
  value = module.core.db_subnet_id
}

output "postgres_private_dns_zone_id" {
  value = module.core.postgres_private_dns_zone_id
}

output "key_vault_name" {
  value = module.core.key_vault_name
}

output "key_vault_tenant_id" {
  value = module.core.key_vault_tenant_id
}
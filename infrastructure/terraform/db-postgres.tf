variable "db_name" {
  type    = string
  default = "nausicaa_staging"
}

variable "db_admin_username" {
  type    = string
  default = "nausicaaadmin"
}

resource "random_password" "db_admin" {
  length  = 24
  special = false
}

resource "azurerm_postgresql_flexible_server" "staging" {
  name                   = "nausicaas-staging-pg"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  administrator_login    = var.db_admin_username
  administrator_password = random_password.db_admin.result
  version                = "15"
  sku_name               = "B_Standard_B1ms"
  storage_mb             = 32768
  backup_retention_days  = 7
  zone                   = "1"
}

resource "azurerm_postgresql_flexible_server_database" "staging" {
  name      = var.db_name
  server_id = azurerm_postgresql_flexible_server.staging.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# TODO - limit access
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure" {
  name      = "allow-azure-services"
  server_id = azurerm_postgresql_flexible_server.staging.id

  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}
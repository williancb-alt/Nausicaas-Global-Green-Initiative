resource "azurerm_resource_group" "main" {
  name     = "nausicaas-rg"
  location = var.location
}

resource "azurerm_container_registry" "acr" {
  name                = "nausicaasacr${random_integer.suffix.result}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = false
}

resource "random_integer" "suffix" {
  min = 10000
  max = 99999
}
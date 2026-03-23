terraform {
  required_version = ">= 1.5.0"
  backend "azurerm" {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "nausicaastate"
    container_name       = "tfstate"
    key                  = "infra/permanent-production.tfstate"
  }
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.116.0"
    }
  }
}

provider "azurerm" {
  features {}
  skip_provider_registration = true
}

data "azurerm_client_config" "current" {}

resource "azurerm_resource_group" "permanent" {
  name     = var.permanent_rg_name
  location = var.location
}

resource "azurerm_key_vault" "permanent" {
  name                       = var.permanent_key_vault_name
  location                   = azurerm_resource_group.permanent.location
  resource_group_name        = azurerm_resource_group.permanent.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  soft_delete_retention_days = 7
  purge_protection_enabled   = false
  enable_rbac_authorization  = true
}

resource "azurerm_role_assignment" "permanent_kv_officer_tf" {
  scope                = azurerm_key_vault.permanent.id
  role_definition_name = "Key Vault Secrets Officer"
  principal_id         = data.azurerm_client_config.current.object_id
}

resource "azurerm_container_registry" "permanent" {
  name                = var.permanent_acr_name
  resource_group_name = azurerm_resource_group.permanent.name
  location            = azurerm_resource_group.permanent.location
  sku                 = "Basic"
  admin_enabled       = false
}
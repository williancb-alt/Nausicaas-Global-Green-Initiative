# This File contains the provider configurations for Terraform.
# How Terraform uses OIDC (OpenID Connect) to authenticate with cloud providers.
# the providers versions action action.
# THe required features.

terraform {
  required_version = ">=1.5.0"

  required_providers {
    azurerm = {
        source = "hashicorp/azurerm"
        version = "~>3.80.0"
    }
  }
}

provider "azurerm" {
  features {}
  use_oidc = true

  subscription_id = var.subscription_id
  tenant_id       = var.tenant_id   
  client_id       = var.client_id
}

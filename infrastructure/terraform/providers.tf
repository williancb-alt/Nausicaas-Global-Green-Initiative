# This File contains the provider configurations for Terraform.
# How Terraform uses OIDC (OpenID Connect) to authenticate with cloud providers.
# the providers versions action action.
# THe required features.

terraform {
  required_version = ">=1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.116.0"
    }
  }
}

provider "azurerm" {
  features {}
  skip_provider_registration = true
}

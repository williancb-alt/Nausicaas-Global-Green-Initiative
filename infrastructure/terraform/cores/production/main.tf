terraform {
  required_version = ">= 1.5.0"
  backend "azurerm" {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "nausicaastate"
    container_name       = "tfstate"
    key                  = "infra/core-production.tfstate"
  }
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.116.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.13"
    }
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = ">= 1.14.0"
    }
  }
}

provider "azurerm" {
  features {}
  skip_provider_registration = true
}

module "core" {
  source = "../../modules/core"

  location       = var.location
  rg_name        = var.rg_name
  aks_name       = var.aks_name
  dns_prefix     = var.dns_prefix
  acr_name       = var.acr_name
  aks_node_count = var.aks_node_count
  aks_node_size  = var.aks_node_size

  db_server_name    = var.db_server_name
  db_name           = var.db_name
  db_admin_username = var.db_admin_username
  db_admin_password = var.db_admin_password
}

module "cert_manager" {
  source = "../../modules/cert_manager"

  acme_email           = var.acme_email
  cloudflare_api_token = var.cloudflare_api_token
  acme_server_url      = var.acme_server_url
  
  wildcard_enabled     = true
  wildcard_namespace   = "production"
  wildcard_secret_name = "nausicaa-wildcard-tls"
  wildcard_dns_name    = "*.nausicaaglobalgreeninitiative.ie"
}
terraform {
  required_version = ">= 1.5.0"

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
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
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

data "terraform_remote_state" "core" {
  backend = "azurerm"
  config = {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "nausicaastate"
    container_name       = "tfstate"
    key                  = "infra/core-staging.tfstate"
  }
}

locals {
  core_rg_name     = data.terraform_remote_state.core.outputs.resource_group_name
  core_location    = data.terraform_remote_state.core.outputs.location
  aks_name         = data.terraform_remote_state.core.outputs.aks_name
  acr_login_server = data.terraform_remote_state.core.outputs.acr_login_server

  database_url = data.terraform_remote_state.core.outputs.database_url
}

data "azurerm_kubernetes_cluster" "aks" {
  name                = local.aks_name
  resource_group_name = local.core_rg_name
}

module "app_backend" {
  source = "../../modules/app_backend"

  resource_group_name = local.core_rg_name
  location            = local.core_location
  acr_login_server    = local.acr_login_server

  backend_hostname  = var.backend_hostname
  backend_image_tag = var.backend_image_tag
  frontend_url      = var.frontend_url

  node_resource_group    = data.azurerm_kubernetes_cluster.aks.node_resource_group
  namespace              = "staging"
  tls_secret_name        = "nausicaa-wildcard-tls"
  ingress_public_ip_name = "nausicaas-staging-ip"
  database_url           = local.database_url
  create_namespace       = false
}

module "dns" {
  source = "../../modules/dns"

  zone_name   = var.cloudflare_zone_name
  record_name = "api-staging"
  record_ip   = module.app_backend.ingress_public_ip
}
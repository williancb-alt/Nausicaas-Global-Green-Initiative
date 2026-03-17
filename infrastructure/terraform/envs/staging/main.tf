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
      version = "~> 1.14.0"
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
    key                  = "infra/core-${var.environment}.tfstate"
  }
}

locals {
  core_rg_name                         = data.terraform_remote_state.core.outputs.resource_group_name
  core_location                        = data.terraform_remote_state.core.outputs.location
  aks_name                             = data.terraform_remote_state.core.outputs.aks_name
  acr_login_server                     = data.terraform_remote_state.core.outputs.acr_login_server
  key_vault_name                       = data.terraform_remote_state.core.outputs.key_vault_name
  key_vault_tenant_id                  = data.terraform_remote_state.core.outputs.key_vault_tenant_id
  key_vault_kubelet_identity_client_id = data.terraform_remote_state.core.outputs.key_vault_kubelet_identity_client_id
  dns_records = {
    api = {
      name = "api-staging"
    }
    root = {
      name = "ui-staging"
    }
  }
}

data "azurerm_kubernetes_cluster" "aks" {
  name                = local.aks_name
  resource_group_name = local.core_rg_name
}

module "app_backend" {
  source = "../../modules/app_backend"

  location = local.core_location

  backend_hostname  = var.backend_hostname
  backend_image_ref = var.backend_image_ref
  frontend_url      = var.frontend_url

  node_resource_group    = data.azurerm_kubernetes_cluster.aks.node_resource_group
  namespace              = var.environment
  environment            = var.environment
  tls_secret_name        = "nausicaa-wildcard-tls"
  ingress_public_ip_name = "nausicaas-staging-ip"
  create_namespace       = false

  key_vault_name                       = local.key_vault_name
  key_vault_tenant_id                  = local.key_vault_tenant_id
  key_vault_kubelet_identity_client_id = local.key_vault_kubelet_identity_client_id
}

module "app_frontend" {
  source = "../../modules/app_frontend"

  frontend_hostname  = var.frontend_hostname
  frontend_image_ref = var.frontend_image_ref

  namespace       = var.environment
  tls_secret_name = "nausicaa-wildcard-tls"
}

module "dns" {
  source = "../../modules/dns"

  for_each = local.dns_records

  zone_name   = var.cloudflare_zone_name
  record_name = each.value.name
  record_ip   = module.app_backend.ingress_public_ip
}
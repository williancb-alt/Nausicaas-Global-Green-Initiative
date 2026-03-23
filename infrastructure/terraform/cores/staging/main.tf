terraform {
  required_version = ">= 1.5.0"
  backend "azurerm" {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "nausicaastate"
    container_name       = "tfstate"
    key                  = "infra/core-staging.tfstate"
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

data "terraform_remote_state" "permanent" {
  backend = "azurerm"
  config = {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "nausicaastate"
    container_name       = "tfstate"
    key                  = "infra/permanent-staging.tfstate"
  }
}

module "core" {
  source = "../../modules/core"

  location       = var.location
  rg_name        = var.rg_name
  aks_name       = var.aks_name
  dns_prefix     = var.dns_prefix
  aks_node_count = var.aks_node_count
  aks_node_size  = var.aks_node_size

  db_server_name    = var.db_server_name
  db_name           = var.db_name
  db_admin_username = var.db_admin_username
  db_admin_password = var.db_admin_password

  acs_email_connection_string = var.acs_email_connection_string
  acs_email_sender            = var.acs_email_sender
  google_client_id            = var.google_client_id
  google_client_secret        = var.google_client_secret
  github_client_id            = var.github_client_id
  github_client_secret        = var.github_client_secret

  key_vault_name = var.key_vault_name

  permanent_acr_name       = data.terraform_remote_state.permanent.outputs.acr_name
  permanent_acr_id         = data.terraform_remote_state.permanent.outputs.acr_id
  permanent_rg_name        = data.terraform_remote_state.permanent.outputs.resource_group_name
  permanent_key_vault_name = data.terraform_remote_state.permanent.outputs.key_vault_name
  permanent_key_vault_id   = data.terraform_remote_state.permanent.outputs.key_vault_id
}

module "cert_manager" {
  source = "../../modules/cert_manager"

  acme_email           = var.acme_email
  cloudflare_api_token = var.cloudflare_api_token
  acme_server_url      = var.acme_server_url
  eso_uami_client_id   = module.core.eso_uami_client_id
}
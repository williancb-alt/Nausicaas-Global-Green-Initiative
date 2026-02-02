terraform {
  backend "azurerm" {
    resource_group_name  = "nausicaas-tfstate-rg"
    storage_account_name = "nausicaastfstate94916"
    container_name       = "tfstate"
    key                  = "infra/terraform.tfstate"
  }
}
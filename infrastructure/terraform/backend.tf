terraform {
  backend "azurerm" {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "nausicaastfstate"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"

    #use_oidc = true
    #subscription_id = "value"
    #tenant_id = "value"
    #client_id = "value"
  }
}
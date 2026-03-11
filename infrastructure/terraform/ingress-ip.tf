resource "azurerm_public_ip" "ingress" {
  name                = "nausicaas-staging-ip"
  resource_group_name = azurerm_kubernetes_cluster.aks.node_resource_group
  location            = azurerm_resource_group.main.location

  allocation_method   = "Static"
  sku                 = "Standard"
}
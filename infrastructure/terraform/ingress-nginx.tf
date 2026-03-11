resource "helm_release" "ingress_nginx" {
  name             = "ingress-nginx"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  chart            = "ingress-nginx"
  namespace        = "ingress-nginx"
  create_namespace = true

  set { 
    name = "controller.service.type"  
    value = "LoadBalancer"  
  }

  set { 
    name = "controller.replicaCount" 
    value = "1" 
  }

  set {
    name  = "controller.service.loadBalancerIP"
    value = azurerm_public_ip.ingress.ip_address
  }

  # Fixes health probes by ensuring traffic doesn't "hop" between nodes
  set {
    name  = "controller.service.externalTrafficPolicy"
    value = "Local"
  }

  # Forces Azure LB to check Nginx's actual health path instead of "/"
  # Note: The backslashes (\\) are required to escape the dots in the annotation key for Terraform
  set {
    name  = "controller.service.annotations.service\\.beta\\.kubernetes\\.io/azure-load-balancer-health-probe-request-path"
    value = "/healthz"
  }
}
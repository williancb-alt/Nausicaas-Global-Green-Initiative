locals {
  backend_image = "${var.acr_login_server}/backend:${var.backend_image_tag}"

  db_host      = azurerm_postgresql_flexible_server.staging.fqdn
  database_url = "postgresql://${var.db_admin_username}:${random_password.db_admin.result}@${local.db_host}:5432/${var.db_name}?sslmode=require"
}

resource "random_password" "db_admin" {
  length  = 24
  special = false
}

resource "azurerm_postgresql_flexible_server" "staging" {
  name                   = "nausicaas-staging-pg"
  resource_group_name    = var.resource_group_name
  location               = var.location
  administrator_login    = var.db_admin_username
  administrator_password = random_password.db_admin.result
  version                = "15"
  sku_name               = "B_Standard_B1ms"
  storage_mb             = 32768
  backup_retention_days  = 7
  zone                   = "1"
  delegated_subnet_id    = var.db_subnet_id
  private_dns_zone_id    = var.postgres_private_dns_zone_id
  public_network_access_enabled = false
}

resource "azurerm_postgresql_flexible_server_database" "staging" {
  name      = var.db_name
  server_id = azurerm_postgresql_flexible_server.staging.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

resource "kubernetes_namespace" "staging" {
  metadata { name = "staging" }
}

resource "random_password" "flask_secret_key" {
  length  = 48
  special = true
}

resource "kubernetes_secret" "backend_env" {
  metadata {
    name      = "backend-env"
    namespace = kubernetes_namespace.staging.metadata[0].name
  }

  type = "Opaque"

  data = {
  SECRET_KEY    = random_password.flask_secret_key.result
  DATABASE_URL  = local.database_url
  FRONTEND_URL  = var.frontend_url
  EMAIL_ENABLED = "false"
  }
}

resource "kubernetes_deployment" "backend" {
  metadata {
    name      = "backend"
    namespace = kubernetes_namespace.staging.metadata[0].name
    labels = { app = "backend" }
  }

  spec {
    replicas = 1

    selector { match_labels = { app = "backend" } }

    template {
      metadata { labels = { app = "backend" } }

      spec {
        container {
          name  = "backend"
          image = local.backend_image

          port { container_port = 8080 }

          env_from {
            secret_ref { name = kubernetes_secret.backend_env.metadata[0].name }
          }
        }
      }
    }
  }

  lifecycle {
    ignore_changes = [
      spec[0].template[0].spec[0].container[0].image
    ]
  }

  depends_on = [helm_release.ingress_nginx]
}

resource "kubernetes_service" "backend" {
  metadata {
    name      = "backend"
    namespace = kubernetes_namespace.staging.metadata[0].name
  }

  spec {
    selector = { app = "backend" }

    port {
      name        = "http"
      port        = 80
      target_port = 8080
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_ingress_v1" "backend" {
  metadata {
    name      = "backend-ingress"
    namespace = kubernetes_namespace.staging.metadata[0].name
    annotations = {
      "kubernetes.io/ingress.class" = "nginx"
      "cert-manager.io/cluster-issuer" = "letsencrypt-prod"
      "nginx.ingress.kubernetes.io/ssl-redirect" = "true"
    }
  }

  spec {
    tls {
      hosts       = [var.backend_hostname]
      secret_name = "api-staging-tls"
    }

    rule {
      host = var.backend_hostname
      http {
        path {
          path      = "/"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service.backend.metadata[0].name
              port { number = 80 }
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_job_v1" "backend_migrate" {
  metadata {
    name      = "backend-migrate"
    namespace = kubernetes_namespace.staging.metadata[0].name
  }

  spec {
    backoff_limit = 1

    template {
      metadata {}

      spec {
        restart_policy = "Never"

        container {
          name  = "migrate"
          image = local.backend_image

          env_from {
            secret_ref { name = kubernetes_secret.backend_env.metadata[0].name }
          }

          command = [
            "sh",
            "-c",
            "python -m flask --app run.py db upgrade"
          ]
        }
      }
    }
  }

  depends_on = [
    kubernetes_secret.backend_env,
    azurerm_postgresql_flexible_server_database.staging
  ]
}

resource "azurerm_public_ip" "ingress" {
  name                = "nausicaas-staging-ip"
  resource_group_name = var.node_resource_group
  location            = var.location

  allocation_method   = "Static"
  sku                 = "Standard"
}

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
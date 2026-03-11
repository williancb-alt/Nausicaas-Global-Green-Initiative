variable "backend_hostname" {
  type    = string
  default = "api-staging.nausicaaglobalgreeninitiative.ie"
}

variable "backend_image_tag" {
  type    = string
  default = "latest"
}

variable "frontend_url_staging" {
  type    = string
  default = "https://app-staging.nausicaaglobalgreeninitiative.ie"
}

locals {
  acr_login_server = "${azurerm_container_registry.acr.name}.azurecr.io"
  backend_image    = "${local.acr_login_server}/backend:${var.backend_image_tag}"

  db_host = azurerm_postgresql_flexible_server.staging.fqdn

  database_url = "postgresql://${var.db_admin_username}:${random_password.db_admin.result}@${local.db_host}:5432/${var.db_name}?sslmode=require"
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
  FRONTEND_URL  = var.frontend_url_staging
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

  depends_on = [helm_release.ingress_nginx]
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
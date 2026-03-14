locals {
  backend_image = var.backend_image_ref

  namespace_name = var.namespace
}

resource "kubernetes_namespace" "app" {
  count = var.create_namespace ? 1 : 0

  metadata {
    name = var.namespace
  }
}

resource "random_password" "flask_secret_key" {
  length  = 48
  special = true
}

resource "kubernetes_manifest" "secret_provider_class" {
  manifest = {
    apiVersion = "secrets-store.csi.x-k8s.io/v1"
    kind       = "SecretProviderClass"
    metadata = {
      name      = "kv-database-url"
      namespace = local.namespace_name
    }
    spec = {
      provider = "azure"
      parameters = {
        usePodIdentity = "false"
        keyvaultName   = var.key_vault_name
        tenantId       = var.key_vault_tenant_id
        objects        = <<-EOT
          array:
            - objectName: database-url
              objectType: secret
        EOT
      }
      secretObjects = [
        {
          secretName = "backend-database-url"
          type       = "Opaque"
          data = [
            {
              objectName = "database-url"
              key        = "DATABASE_URL"
            }
          ]
        }
      ]
    }
  }
}

resource "kubernetes_secret" "backend_env" {
  metadata {
    name      = "backend-env"
    namespace = local.namespace_name
  }

  type = "Opaque"

  data = {
    SECRET_KEY    = random_password.flask_secret_key.result
    FRONTEND_URL  = var.frontend_url
    EMAIL_ENABLED = "false"
  }
}

resource "kubernetes_deployment" "backend" {
  metadata {
    name      = "backend"
    namespace = local.namespace_name
    labels    = { app = "backend" }
  }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "backend" }
    }

    template {
      metadata {
        labels = { app = "backend" }
      }

      spec {
        container {
          name  = "backend"
          image = local.backend_image

          volume_mount {
            name       = "kv-secrets"
            mount_path = "/mnt/secrets-store"
            read_only  = true
          }

          port {
            container_port = 8080
          }

          env_from {
            secret_ref {
              name = kubernetes_secret.backend_env.metadata[0].name
            }
          }

          env_from {
            secret_ref {
              name = "backend-database-url"
            }
          }
        }

        volume {
          name = "kv-secrets"
          csi {
            driver    = "secrets-store.csi.k8s.io"
            read_only = true
            volume_attributes = {
              secretProviderClass = "kv-database-url"
            }
          }
        }
      }
    }
  }

  depends_on = [
    helm_release.ingress_nginx,
    kubernetes_manifest.secret_provider_class,
  ]
}

resource "kubernetes_service" "backend" {
  metadata {
    name      = "backend"
    namespace = local.namespace_name
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
    namespace = local.namespace_name
    annotations = {
      "kubernetes.io/ingress.class"              = "nginx"
      "cert-manager.io/cluster-issuer"           = "letsencrypt-prod"
      "nginx.ingress.kubernetes.io/ssl-redirect" = "true"
    }
  }

  spec {
    tls {
      hosts       = [var.backend_hostname]
      secret_name = var.tls_secret_name
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

              port {
                number = 80
              }
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
    namespace = local.namespace_name
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

          volume_mount {
            name       = "kv-secrets"
            mount_path = "/mnt/secrets-store"
            read_only  = true
          }

          env_from {
            secret_ref {
              name = kubernetes_secret.backend_env.metadata[0].name
            }
          }

          env_from {
            secret_ref {
              name = "backend-database-url"
            }
          }

          command = [
            "sh",
            "-c",
            "python -m flask --app run.py db upgrade",
          ]
        }

        volume {
          name = "kv-secrets"
          csi {
            driver    = "secrets-store.csi.k8s.io"
            read_only = true
            volume_attributes = {
              secretProviderClass = "kv-database-url"
            }
          }
        }
      }
    }
  }

  depends_on = [
    kubernetes_secret.backend_env,
    kubernetes_manifest.secret_provider_class,
  ]
}

resource "azurerm_public_ip" "ingress" {
  name                = var.ingress_public_ip_name
  resource_group_name = var.node_resource_group
  location            = var.location

  allocation_method = "Static"
  sku               = "Standard"
}

resource "helm_release" "ingress_nginx" {
  name             = "ingress-nginx"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  chart            = "ingress-nginx"
  version          = "4.11.2"
  namespace        = "ingress-nginx"
  create_namespace = true

  set {
    name  = "controller.service.type"
    value = "LoadBalancer"
  }

  set {
    name  = "controller.replicaCount"
    value = "1"
  }

  set {
    name  = "controller.service.loadBalancerIP"
    value = azurerm_public_ip.ingress.ip_address
  }

  set {
    name  = "controller.service.externalTrafficPolicy"
    value = "Local"
  }

  set {
    name  = "controller.service.annotations.service\\.beta\\.kubernetes\\.io/azure-load-balancer-health-probe-request-path"
    value = "/healthz"
  }
}
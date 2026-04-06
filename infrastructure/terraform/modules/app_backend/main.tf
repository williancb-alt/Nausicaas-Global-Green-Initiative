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
        usePodIdentity         = "false"
        useVMManagedIdentity   = "true"
        userAssignedIdentityID = var.key_vault_kubelet_identity_client_id
        keyvaultName           = var.key_vault_name
        tenantId               = var.key_vault_tenant_id
        objects                = <<-EOT
          array:
            - |
              objectName: database-url
              objectType: secret
            - |
              objectName: acs-email-connection-string
              objectType: secret
            - |
              objectName: acs-email-sender
              objectType: secret
            - |
              objectName: google-client-id
              objectType: secret
            - |
              objectName: google-client-secret
              objectType: secret
            - |
              objectName: github-client-id
              objectType: secret
            - |
              objectName: github-client-secret
              objectType: secret
        EOT
      }
      secretObjects = [
        {
          secretName = "backend-config"
          type       = "Opaque"
          data = [
            {
              objectName = "database-url"
              key        = "DATABASE_URL"
            },
            {
              objectName = "acs-email-connection-string"
              key        = "ACS_EMAIL_CONNECTION_STRING"
            },
            {
              objectName = "acs-email-sender"
              key        = "ACS_EMAIL_SENDER"
            },
            {
              objectName = "google-client-id"
              key        = "GOOGLE_CLIENT_ID"
            },
            {
              objectName = "google-client-secret"
              key        = "GOOGLE_CLIENT_SECRET"
            },
            {
              objectName = "github-client-id"
              key        = "GITHUB_CLIENT_ID"
            },
            {
              objectName = "github-client-secret"
              key        = "GITHUB_CLIENT_SECRET"
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
    EMAIL_ENABLED = "true"
    FLASK_ENV     = var.environment
    SEED_PASSWORD = var.seed_password
  }
}

resource "kubernetes_deployment" "backend" {
  metadata {
    name      = "backend"
    namespace = local.namespace_name
    labels = {
      "app.kubernetes.io/name"       = "backend"
      "app.kubernetes.io/component"  = "api"
      "app.kubernetes.io/part-of"    = "nausicaa"
      "app.kubernetes.io/managed-by" = "terraform"
      "app.kubernetes.io/env"        = var.environment
    }
  }

  spec {
    selector {
      match_labels = { app = "backend" }
    }

    template {
      metadata {
        labels = {
          app                      = "backend"
          "app.kubernetes.io/name" = "backend"
          "app.kubernetes.io/env"  = var.environment
        }
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

          startup_probe {
            http_get {
              path = "/health"
              port = 8080
            }
            period_seconds    = 10
            failure_threshold = 12
            timeout_seconds   = 5
          }

          liveness_probe {
            http_get {
              path = "/health"
              port = 8080
            }
            period_seconds  = 15
            timeout_seconds = 5
          }

          readiness_probe {
            http_get {
              path = "/ready"
              port = 8080
            }
            period_seconds  = 10
            timeout_seconds = 3
          }

          resources {
            requests = {
              cpu    = "150m"
              memory = "256Mi"
            }
            limits = {
              cpu    = "1000m"
              memory = "512Mi"
            }
          }

          env_from {
            secret_ref {
              name = kubernetes_secret.backend_env.metadata[0].name
            }
          }

          env_from {
            secret_ref {
              name = "backend-config"
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

resource "kubernetes_horizontal_pod_autoscaler_v2" "backend" {
  metadata {
    name      = "backend"
    namespace = local.namespace_name
  }

  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment.backend.metadata[0].name
    }

    min_replicas = 1
    max_replicas = 10

    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = 50
        }
      }
    }

    behavior {
      scale_up {
        stabilization_window_seconds = 30
        select_policy                = "Max"
        policy {
          type           = "Pods"
          value          = 2
          period_seconds = 60
        }
      }
      scale_down {
        stabilization_window_seconds = 300
        select_policy                = "Min"
        policy {
          type           = "Pods"
          value          = 1
          period_seconds = 60
        }
      }
    }
  }
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

          resources {
            requests = {
              cpu    = "100m"
              memory = "256Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
          }

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
              name = "backend-config"
            }
          }

          command = [
            "sh",
            "-c",
            "python -m flask --app run.py db upgrade && python -m flask --app run.py seed-db",
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
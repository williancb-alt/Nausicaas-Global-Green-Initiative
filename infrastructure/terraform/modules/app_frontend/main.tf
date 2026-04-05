locals {
  namespace_name = var.namespace
}

resource "kubernetes_deployment" "frontend" {
  metadata {
    name      = "frontend"
    namespace = local.namespace_name
    labels    = { app = "frontend" }
  }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "frontend" }
    }

    template {
      metadata {
        labels = { app = "frontend" }
      }

      spec {
        container {
          name  = "frontend"
          image = var.frontend_image_ref

          port {
            container_port = 80
          }

          env {
            name  = "VITE_API_BASE_URL"
            value = "http://backend:80"
          }

          env {
            name  = "SERVER_NAME"
            value = var.frontend_hostname
          }

          env {
            name  = "PUBLIC_API_URL"
            value = "https://${var.backend_hostname}"
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "frontend" {
  metadata {
    name      = "frontend"
    namespace = local.namespace_name
  }

  spec {
    selector = { app = "frontend" }

    port {
      name        = "http"
      port        = 80
      target_port = 80
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_ingress_v1" "frontend" {
  metadata {
    name      = "frontend-ingress"
    namespace = local.namespace_name
    annotations = {
      "kubernetes.io/ingress.class"              = "nginx"
      "nginx.ingress.kubernetes.io/ssl-redirect" = "true"
    }
  }

  spec {
    tls {
      hosts       = [var.frontend_hostname]
      secret_name = var.tls_secret_name
    }

    rule {
      host = var.frontend_hostname

      http {
        path {
          path      = "/"
          path_type = "Prefix"

          backend {
            service {
              name = kubernetes_service.frontend.metadata[0].name

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
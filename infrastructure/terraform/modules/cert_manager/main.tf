resource "helm_release" "cert_manager" {
  name             = "cert-manager"
  repository       = "https://charts.jetstack.io"
  chart            = "cert-manager"
  namespace        = "cert-manager"
  create_namespace = true
  version          = "v1.16.0"

  set {
    name  = "installCRDs"
    value = "true"
  }
}

resource "kubernetes_secret" "cloudflare_api_token" {
  metadata {
    name      = "cloudflare-api-token-secret"
    namespace = "cert-manager"
  }

  type = "Opaque"

  data = {
    api-token = var.cloudflare_api_token
  }

  depends_on = [helm_release.cert_manager]
}

resource "kubectl_manifest" "cluster_issuer" {
  yaml_body = <<YAML
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: ${var.issuer_name}
spec:
  acme:
    server: ${var.acme_server_url}
    email: ${var.acme_email}
    privateKeySecretRef:
      name: ${var.issuer_name}-account-key
    solvers:
    - dns01:
        cloudflare:
          apiTokenSecretRef:
            name: cloudflare-api-token-secret
            key: api-token
YAML

  validate_schema = false
  depends_on      = [helm_release.cert_manager]
}

resource "helm_release" "external_secrets" {
  name             = "external-secrets"
  repository       = "https://charts.external-secrets.io"
  chart            = "external-secrets"
  namespace        = "external-secrets"
  create_namespace = true
  version          = "2.1.0"

  set {
    name  = "installCRDs"
    value = "true"
  }

  depends_on = [helm_release.cert_manager]
}
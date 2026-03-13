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

resource "kubernetes_namespace" "wildcard_namespace" {
  count = var.wildcard_enabled ? 1 : 0

  metadata {
    name = var.wildcard_namespace
  }
}

resource "kubectl_manifest" "wildcard_certificate" {
  count = var.wildcard_enabled ? 1 : 0

  yaml_body = <<YAML
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: wildcard-nausicaa
  namespace: ${var.wildcard_namespace}
spec:
  secretName: ${var.wildcard_secret_name}
  issuerRef:
    name: ${var.issuer_name}
    kind: ClusterIssuer
  dnsNames:
    - "${var.wildcard_dns_name}"
YAML

  validate_schema = false

  depends_on = [
    helm_release.cert_manager,
    kubectl_manifest.cluster_issuer,
    kubernetes_namespace.wildcard_namespace,
  ]
}
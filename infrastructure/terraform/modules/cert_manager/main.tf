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

resource "helm_release" "external_secrets" {
  count            = var.wildcard_enabled && var.permanent_key_vault_name != "" ? 1 : 0
  name             = "external-secrets"
  repository       = "https://charts.external-secrets.io"
  chart            = "external-secrets"
  namespace        = "external-secrets"
  create_namespace = true

  set {
    name  = "installCRDs"
    value = "true"
  }

  depends_on = [helm_release.cert_manager]
}

resource "kubectl_manifest" "azure_secret_store" {
  count = var.wildcard_enabled && var.permanent_key_vault_name != "" && var.azure_tenant_id != "" ? 1 : 0

  yaml_body = <<YAML
apiVersion: external-secrets.io/v1beta1
kind: ClusterSecretStore
metadata:
  name: azure-permanent
spec:
  provider:
    azurekv:
      authType: WorkloadIdentity
      tenantId: ${var.azure_tenant_id}
      vaultUrl: "https://${var.permanent_key_vault_name}.vault.azure.net"
YAML

  depends_on = [helm_release.external_secrets]
}

resource "kubectl_manifest" "push_wildcard_to_akv" {
  count = var.wildcard_enabled && var.permanent_key_vault_name != "" ? 1 : 0

  yaml_body = <<YAML
apiVersion: external-secrets.io/v1beta1
kind: PushSecret
metadata:
  name: wildcard-tls-to-akv
  namespace: ${var.wildcard_namespace}
spec:
  refreshInterval: 1h
  secretStoreRefs:
    - name: azure-permanent
      kind: ClusterSecretStore
  selector:
    secret:
      name: ${var.wildcard_secret_name}
  data:
    - match:
        secretKey: tls.crt
      remoteRef:
        remoteKey: wildcard-tls-crt
    - match:
        secretKey: tls.key
      remoteRef:
        remoteKey: wildcard-tls-key
YAML

  depends_on = [
    kubectl_manifest.wildcard_certificate,
    kubectl_manifest.azure_secret_store,
  ]
}

resource "kubectl_manifest" "pull_wildcard_from_akv" {
  count = var.wildcard_enabled && var.permanent_key_vault_name != "" ? 1 : 0

  yaml_body = <<YAML
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: wildcard-tls-from-akv
  namespace: ${var.wildcard_namespace}
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: azure-permanent
    kind: ClusterSecretStore
  target:
    name: ${var.wildcard_secret_name}
    creationPolicy: Owner
  data:
    - secretKey: tls.crt
      remoteRef:
        key: wildcard-tls-crt
    - secretKey: tls.key
      remoteRef:
        key: wildcard-tls-key
YAML

  depends_on = [
    kubernetes_namespace.wildcard_namespace,
    kubectl_manifest.azure_secret_store,
  ]
}
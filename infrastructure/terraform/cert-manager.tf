# Install cert-manager and its CRDs
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

# Create the ClusterIssuer once cert-manager is ready
resource "kubectl_manifest" "letsencrypt_issuer" {
  yaml_body = <<YAML
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    # server: https://acme-v02.api.letsencrypt.org/directory (commenting out as limit of 5 per week)
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: johndennehy101@gmail.com
    privateKeySecretRef:
      name: letsencrypt-prod-account-key
    solvers:
    - http01:
        ingress:
          class: nginx
YAML

  validate_schema = false
  depends_on = [helm_release.cert_manager]
}
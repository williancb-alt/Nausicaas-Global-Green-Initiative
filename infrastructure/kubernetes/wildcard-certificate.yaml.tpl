apiVersion: v1
kind: Namespace
metadata:
  name: ${ENVIRONMENT}
---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: wildcard-nausicaa
  namespace: ${ENVIRONMENT}
spec:
  secretName: nausicaa-wildcard-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
    - "*.nausicaaglobalgreeninitiative.ie"
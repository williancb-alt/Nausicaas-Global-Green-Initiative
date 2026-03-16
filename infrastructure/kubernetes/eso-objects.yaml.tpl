apiVersion: external-secrets.io/v1
kind: ClusterSecretStore
metadata:
  name: azure-permanent
spec:
  provider:
    azurekv:
      authType: WorkloadIdentity
      tenantId: ${ARM_TENANT_ID}
      vaultUrl: "https://${TF_VAR_permanent_key_vault_name}.vault.azure.net"
---
apiVersion: external-secrets.io/v1alpha1
kind: PushSecret
metadata:
  name: wildcard-tls-to-akv
  namespace: ${ENVIRONMENT}
spec:
  refreshInterval: 1h
  secretStoreRefs:
    - name: azure-permanent
      kind: ClusterSecretStore
  selector:
    secret:
      name: nausicaa-wildcard-tls
  data:
    - match:
        secretKey: tls.crt
        remoteRef:
          remoteKey: wildcard-tls-crt
    - match:
        secretKey: tls.key
        remoteRef:
          remoteKey: wildcard-tls-key
---
apiVersion: external-secrets.io/v1
kind: ExternalSecret
metadata:
  name: wildcard-tls-from-akv
  namespace: ${ENVIRONMENT}
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: azure-permanent
    kind: ClusterSecretStore
  target:
    name: nausicaa-wildcard-tls
    creationPolicy: Owner
  data:
    - secretKey: tls.crt
      remoteRef:
        key: wildcard-tls-crt
    - secretKey: tls.key
      remoteRef:
        key: wildcard-tls-key
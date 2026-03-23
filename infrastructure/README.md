# Infrastructure

This directory contains the infrastructure-as-code for Nausicaa’s Azure and Kubernetes deployment.

## Overview

- `infrastructure/terraform/`
  - `permanent/` (**long-lived**): Azure resource group, Key Vault, and Azure Container Registry (ACR). Low cost resources, key vault allows us to store Let's encrypt certs for reuse across core and env deployments (to avoid hitting rate limits of Let's Encrypt)
  - `cores/` (**cluster and platform**): AKS, networking, PostgreSQL (private), per-environment Key Vault, cert-manager and external-secrets.
  - `envs/` (**apps**): Deploys backend and frontend workloads into AKS, plus Cloudflare DNS records (Cloudflare used to manage domain as terraform provider allows easy customisation of records)
  - `modules/`: Reusable Terraform modules used by the above layers.
- `infrastructure/kubernetes/`
  - `eso-objects.yaml.tpl`: External Secrets Operator objects for syncing/pushing the wildcard TLS secret to/from the **permanent** Key Vault.
  - `wildcard-certificate.yaml.tpl`: Creates the wildcard cert secret in the target namespace via cert-manager.

## Why the split exists (permanent vs cores vs envs)

Intentionally split Terraform into three layers to **optimise cost**:

- **`permanent/` (rarely changes - should not be destroyed)**  
  Long-lived shared resources that are **cheap to run** but **high-impact to recreate** and commonly shared across environments:

  ACR (image registry)

  “Permanent” Key Vault (durable store for shared items like wildcard TLS material)

**Why keep them permanent**: Main reason here is need for permanent key-vault to store the let's encrypt certs (as rate limits there are tight enough per week).

- **`cores/` (infrequent changes)**  
  The “platform” layer: networking, AKS, private PostgreSQL, per-environment Key Vault, cert-manager, and External Secrets Operator.
  **Time-to-change**: core changes are typically **slow** (AKS/DB/network provisioning and Helm-installed controllers can take minutes to tens of minutes).  
  **Cost benefit**: these are the biggest cost drivers (AKS/DB/public IPs), so we avoid rebuilding them during normal app iterations and can tear them down in staging for cost optimisation.  
  **Reliability benefit**: separating this from resources in envs keeps app deploys fast and safer.
- **`envs/` (frequent changes)**  
  The “application” layer: deploy backend/frontend into AKS, configure ingress/public IP usage, and set Cloudflare DNS records.
  **Cost benefit**: app deploys do not force re-provisioning AKS/DB.  
  **Velocity benefit**: app changes can be applied often (and rolled back) without touching platform resources.

  So the idea would be that if demoing the application, we could spin up the cores early in the morning (and then just do quicker `envs/)

## Environments

This repo currently has two environments mirrored across layers:

- `staging`
- `production`

| Environment | UI URL                                                    | API URL                                                        |
| ----------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| staging     | https://ui-staging.nausicaaglobalgreeninitiative.ie/login | https://api-staging.nausicaaglobalgreeninitiative.ie/api/v1/ui |
| production  | https://ui.nausicaaglobalgreeninitiative.ie/login         | https://api.nausicaaglobalgreeninitiative.ie/api/v1/ui         |

Terraform working directories map as:

- **permanent**
  - `infrastructure/terraform/permanent/staging`
  - `infrastructure/terraform/permanent/production`
- **core**
  - `infrastructure/terraform/cores/staging`
  - `infrastructure/terraform/cores/production`
- **app**
  - `infrastructure/terraform/envs/staging`
  - `infrastructure/terraform/envs/production`

## State backend (AzureRM)

All layers use an Azure Storage backend (hard-coded in the Terraform configs):

- Resource group: `tfstate-rg`
- Storage account: `nausicaastate`
- Container: `tfstate`

State keys follow this pattern:

- `infra/permanent-<env>.tfstate`
- `infra/core-<env>.tfstate`
- (app layer reads core state via remote state: `infra/core-<env>.tfstate`)

## Layer responsibilities

### 1) `permanent` layer (ACR and permanent Key Vault)

Creates:

- Azure resource group for permanent shared resources
- Permanent Key Vault (RBAC enabled)
- Azure Container Registry (ACR)

Notes:

- GitHub Actions blocks `destroy` for this layer (as these should not be destroyed)

### 2) `core` layer (AKS and platform services)

Creates:

- Per-environment resource group and virtual network/subnets
- AKS (OIDC issuer and workload identity enabled)
- Private PostgreSQL Flexible Server and private DNS zone
- Per-environment Key Vault (RBAC enabled) populated with app secrets (e.g. `database-url`, OAuth secrets, ACS email secrets)
- Role assignments:
  - AKS kubelet identity can pull from the permanent ACR (`AcrPull`)
  - AKS kubelet identity has `Key Vault Secrets User` on the per-environment Key Vault
  - Terraform runner principal has `Key Vault Secrets Officer` on relevant vaults
- Installs platform Helm charts:
  - cert-manager
  - external-secrets (configured for Azure Workload Identity)

After `core` applies, the GitHub workflow also applies:

- External-secrets objects (`infrastructure/kubernetes/eso-objects.yaml.tpl`)
- Wildcard certificate (`infrastructure/kubernetes/wildcard-certificate.yaml.tpl`)

### 3) `app` layer (workloads and ingress and DNS)

Creates/installs into the AKS cluster:

- Backend:
  - Ingress NGINX (Helm) with a **static Azure Public IP**
  - Backend Deployment/Service/Ingress
  - CSI SecretProviderClass to sync Key Vault secrets into `backend-config`
  - A one-off Job `backend-migrate` to run DB migrations
- Frontend:
  - Frontend Deployment/Service/Ingress

DNS:

- Cloudflare A records are created pointing at the backend ingress public IP.
  - Production: `api` and `ui`
  - Staging: `api-staging` and `ui-staging`

## CI/CD (GitHub Actions) - recommended approach

Terraform is run via `.github/workflows/terraform-deploy.yml` with inputs:

- `layer`: `permanent | core | app`
- `environment`: `staging | production`
- `action`: `plan | apply | destroy`
- `image_tag` (optional, app layer): resolves to digests in ACR and sets:
  - `TF_VAR_backend_image_ref=<acr>/backend@sha256:...`
  - `TF_VAR_frontend_image_ref=<acr>/frontend@sha256:...`

Important behaviour:

- `destroy` is blocked for `layer=permanent`
- For `layer=core` and `apply`, the workflow obtains AKS credentials and applies the ESO and wildcard cert templates.

## Required GitHub configuration

The Terraform workflow uses:

- OIDC login to Azure (`azure/login@v2`) with `ARM_USE_OIDC=true`
- GitHub **Secrets** for `ARM_*` and most `TF_VAR_*`
- GitHub **Environment variables** for `ACR_NAME` (used to form `<ACR_NAME>.azurecr.io`)

The exact variables are wired into the workflow in `.github/workflows/terraform-deploy.yml`.

## Running Terraform locally

Local Terraform is supported for debugging, but staging/production changes should be done via pipelines for auditability and consistent credentials.

If you run locally, you’ll need:

- Terraform (workflow uses `1.6.2`, configs require `>= 1.5.0`)
- Azure CLI logged in with access to the subscription
- Access to the backend state storage account/container
- Appropriate values for required `TF_VAR_*` variables

Example (staging core):

```sh
cd infrastructure/terraform/cores/staging
terraform fmt
terraform init
terraform validate
terraform plan
terraform apply
```

## TLS (cert-manager and External Secrets Operator)

The repo manages a wildcard TLS secret shared by ingresses (nausicaa-wildcard-tls).

High-level flow:

1. cert-manager issues/maintains a wildcard Certificate in the environment namespace
2. The resulting secret is named nausicaa-wildcard-tls
3. ESO PushSecret pushes tls.crt/tls.key into the permanent Key Vault as:

- wildcard-tls-crt
- wildcard-tls-key

4. ESO ExternalSecret pulls those values back into Kubernetes as nausicaa-wildcard-tls

This provides a consistent TLS secret name for ingresses and a durable copy in the permanent vault (this helps avoid Let’s Encrypt rate limits). This is handled by External Secrets Operator via `infrastructure/kubernetes/eso-objects.yaml.tpl` and the wildcard cert via `infrastructure/kubernetes/wildcard-certificate.yaml.tpl`.

## GitHub Actions overview (build/release/deploy)

### Release (.github/workflows/release.yml)

Triggers:

- On push of tags matching `v*` or `*.*.*`
- Or manual run via workflow_dispatch

Behaviour:

When triggered by a pushed tag, it validates that:

- frontend/package.json version equals the tag version
- backend/setup.py version equals the tag version

Then it creates a GitHub Release with generated notes.

When run manually (workflow_dispatch), it can:

- update backend/frontend version files
- commit those changes
- create and push the annotated tag v<version> if missing

### Build & push images (.github/workflows/push-to-acr.yml)

Triggers:

- Manual (workflow_dispatch)
- Called by other workflows (workflow_call)

Behaviour:

- Logs into Azure via OIDC
- Logs into ACR
- Builds and pushes:
  - backend as ACR/backend:<tag>
  - frontend as ACR/frontend:<tag> (with build args for API base URL and server name)

If tag is not supplied, it defaults to the environment name (staging/production)

### Terraform deploy (.github/workflows/terraform-deploy.yml)

Triggers:

- Manual (workflow_dispatch)
- Callable (workflow_call)

Inputs:

- layer: permanent | core | app
- environment: staging | production
- action: plan | apply | destroy
- image_tag (optional; used by layer=app)

Key behaviour:

- Determines the correct working directory from layer and environment
- Runs fmt, init, validate, plan, and optionally apply/destroy
- For layer=app:
  - resolves backend:<image_tag> and frontend:<image_tag> in ACR to digests
  - applies Terraform with digest-pinned TF_VAR_backend_image_ref / TF_VAR_frontend_image_ref
- For layer=core and apply:
  - fetches AKS credentials
  - applies ESO objects and wildcard certificate templates

Blocks destroy for layer=permanent

## Staging workflow (CI/CD)

Staging deployments are handled in: `.github/workflows/staging.yml` (named **“Staging CI / CD”**).

### Triggers

- **On push to `main`** (continuous delivery to staging)
- **Manually** via `workflow_dispatch` (rerun staging deploy without a code push)

### What it does (end-to-end)

1. **Runs backend CI** (reuses `.github/workflows/backend-ci.yml`)
2. **Runs frontend CI** (reuses `.github/workflows/frontend-ci.yml`)
3. **Runs Playwright E2E** (reuses `.github/workflows/playwright-e2e.yml`) against local docker-compose test services
4. **Ensures staging core infra is in place**  
   Calls `.github/workflows/terraform-deploy.yml` with:
   - `layer=core`
   - `environment=staging`
   - `action=apply`
5. **Builds & pushes staging images to ACR**  
   Calls `.github/workflows/push-to-acr.yml` with:
   - `environment=staging`
   - (no `tag` provided) → defaults to tagging images as `:staging`
6. **Deploys the staging app layer**  
   Calls `.github/workflows/terraform-deploy.yml` with:
   - `layer=app`
   - `environment=staging`
   - `action=apply`
   - (no `image_tag` provided) → defaults to `staging`, and the deploy workflow pins digests from `backend:staging` and `frontend:staging`

### Why this matters

- Staging deploys are **pipeline-driven** and gated by CI and E2E, which reduces the chance of deploying broken builds.
- Staging uses a moving tag (`staging`) but the deploy is still **digest-pinned** at apply time (tag → digest), improving repeatability.

## Staging cost optimisation (scheduled teardown)

There is a second staging workflow focused on cost control: `.github/workflows/staging-cleanup.yml` (named **“Staging env scheduled destroy (for Azure cost optimisation)”**).

### What triggers it

- **Scheduled**: daily at `01:00` UTC (`cron: "0 1 * * *"`)
- **Manually**: `workflow_dispatch`

### What it does

- Destroys staging in the correct order to avoid dependency issues:
  1. **Destroy staging app layer** (`layer=app`, `environment=staging`, `action=destroy`)
  2. **Destroy staging core layer** (`layer=core`, `environment=staging`, `action=destroy`)

This is the “cost optimisation” side of the split:

- We can tear down **core/app** staging resources (AKS/DB/ingress) on a schedule,
- While keeping **permanent** resources (ACR/permanent Key Vault/state backend) intact.

## How to use staging (examples)

### Deploy latest to staging (normal path)

- Merge to `main` and `staging.yml` runs automatically and deploys to staging if CI/E2E pass.

### Re-deploy staging without a new merge

- Run workflow **“Staging CI / CD”** (`staging.yml`) manually.

### Tear down staging to save cost

- Let the schedule run, or manually run **“Staging env scheduled destroy”** (`staging-cleanup.yml`).

### Production deployment

Production deployments are handled in: `.github/workflows/production.yml` (named **“Production Deploy”**).

Trigger:

- Manual (workflow_dispatch) with input tag (e.g. v1.2.3)

What it does:

1. Validates that the tag exists and resolves it to a commit SHA
2. Security check: refuses to deploy if the tag commit is not contained in main
3. Ensures production core infra is applied (calls terraform-deploy.yml)
4. Builds and pushes ACR images tagged with the version (calls push-to-acr.yml with tag=1.2.3)
5. Deploys the production app using image_tag=1.2.3 (calls terraform-deploy.yml)

#### Production approval

This workflow runs with environment: production. The run will pause for approval before proceeding (This has been configured in GitHub Environments settings for all users - need approval before prod deployment).

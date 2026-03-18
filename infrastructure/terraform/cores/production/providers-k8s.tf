provider "kubernetes" {
  host                   = module.core.kube_host
  client_certificate     = base64decode(module.core.kube_client_certificate)
  client_key             = base64decode(module.core.kube_client_key)
  cluster_ca_certificate = base64decode(module.core.kube_cluster_ca_certificate)
}

provider "helm" {
  kubernetes {
    host                   = module.core.kube_host
    client_certificate     = base64decode(module.core.kube_client_certificate)
    client_key             = base64decode(module.core.kube_client_key)
    cluster_ca_certificate = base64decode(module.core.kube_cluster_ca_certificate)
  }
}

provider "kubectl" {
  host                   = module.core.kube_host
  client_certificate     = base64decode(module.core.kube_client_certificate)
  client_key             = base64decode(module.core.kube_client_key)
  cluster_ca_certificate = base64decode(module.core.kube_cluster_ca_certificate)
  load_config_file       = false
}
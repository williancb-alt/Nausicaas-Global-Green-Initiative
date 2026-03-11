variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}

variable "cloudflare_zone_name" {
  type    = string
  default = "nausicaaglobalgreeninitiative.ie"
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

data "cloudflare_zone" "main" {
  name = var.cloudflare_zone_name
}

resource "cloudflare_record" "api_staging" {
  zone_id = data.cloudflare_zone.main.id
  name    = "api-staging"
  type    = "A"
  content = azurerm_public_ip.ingress.ip_address
  ttl     = 60
  proxied = false            # start DNS-only; you can turn proxy on later
}
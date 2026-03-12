terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

data "cloudflare_zone" "main" {
  name = var.zone_name
}

resource "cloudflare_record" "a_record" {
  zone_id = data.cloudflare_zone.main.id
  name    = var.record_name
  type    = "A"
  content = var.record_ip
  ttl     = 60
  proxied = false
}
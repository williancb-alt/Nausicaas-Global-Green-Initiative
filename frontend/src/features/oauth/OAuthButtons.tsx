import { type JSX } from "react"
import { Button } from "../../components/button/Button"
import { GitHubIcon } from "./icons/GitHubIcon"
import { GoogleIcon } from "./icons/GoogleIcon"
import { OAUTH_PROVIDERS, type OAuthVariant } from "./oAuthConfig"

function getOAuthBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "")
}

const PROVIDER_ICONS = {
  google: GoogleIcon,
  github: GitHubIcon,
} as const

export function OAuthButtons({
  variant = "signin",
}: {
  variant?: OAuthVariant
}): JSX.Element {
  const base = getOAuthBaseUrl()

  return (
    <>
      {OAUTH_PROVIDERS.map((provider, index) => {
        const Icon = PROVIDER_ICONS[provider.id]
        const label = provider.labels[variant]
        const isFirst = index === 0
        return (
          <Button
            key={provider.id}
            type="button"
            variant="secondary"
            className={`p-2 w-100 rounded d-flex align-items-center justify-content-center gap-2 ${isFirst ? "mt-3" : "mt-2"}`}
            style={provider.buttonStyle}
            onClick={() => {
              window.location.href = `${base}${provider.path}`
            }}
          >
            <Icon />
            {label}
          </Button>
        )
      })}
    </>
  )
}

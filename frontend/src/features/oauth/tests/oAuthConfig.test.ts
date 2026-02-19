import { describe, it, expect } from "vitest"
import { OAUTH_PROVIDERS, type OAuthVariant } from "../oAuthConfig"

describe("oAuthConfig", () => {
  it("exports exactly two OAuth providers", () => {
    expect(OAUTH_PROVIDERS).toHaveLength(2)
  })

  it("each provider has id, path, labels, and buttonStyle", () => {
    const requiredKeys = ["id", "path", "labels", "buttonStyle"] as const
    for (const provider of OAUTH_PROVIDERS) {
      for (const key of requiredKeys) {
        expect(provider).toHaveProperty(key)
      }
    }
  })

  it("labels include both signin and signup for each provider", () => {
    const variants: OAuthVariant[] = ["signin", "signup"]
    for (const provider of OAUTH_PROVIDERS) {
      for (const v of variants) {
        expect(provider.labels[v]).toBeDefined()
        expect(typeof provider.labels[v]).toBe("string")
      }
    }
  })

  it("Google provider has expected id, path and labels", () => {
    const google = OAUTH_PROVIDERS.find(p => p.id === "google")
    expect(google).toBeDefined()
    expect(google!.path).toBe("/api/v1/auth/oauth/google")
    expect(google!.labels.signin).toBe("Sign in with Google")
    expect(google!.labels.signup).toBe("Sign up with Google")
  })

  it("GitHub provider has expected id, path and labels", () => {
    const github = OAUTH_PROVIDERS.find(p => p.id === "github")
    expect(github).toBeDefined()
    expect(github!.path).toBe("/api/v1/auth/oauth/github")
    expect(github!.labels.signin).toBe("Sign in with GitHub")
    expect(github!.labels.signup).toBe("Sign up with GitHub")
  })

  it("each provider buttonStyle has backgroundColor, border, and color", () => {
    for (const provider of OAUTH_PROVIDERS) {
      expect(provider.buttonStyle).toHaveProperty("backgroundColor")
      expect(provider.buttonStyle).toHaveProperty("border")
      expect(provider.buttonStyle).toHaveProperty("color")
    }
  })
})

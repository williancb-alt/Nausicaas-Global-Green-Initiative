import React from "react"

export type OAuthVariant = "signin" | "signup"

export const OAUTH_PROVIDERS: Array<{
  id: "google" | "github"
  path: string
  labels: Record<OAuthVariant, string>
  buttonStyle: React.CSSProperties
}> = [
  {
    id: "google",
    path: "/api/v1/auth/oauth/google",
    labels: {
      signin: "Sign in with Google",
      signup: "Sign up with Google",
    },
    buttonStyle: {
      backgroundColor: "#fff",
      border: "1px solid #dadce0",
      color: "#3c4043",
    },
  },
  {
    id: "github",
    path: "/api/v1/auth/oauth/github",
    labels: {
      signin: "Sign in with GitHub",
      signup: "Sign up with GitHub",
    },
    buttonStyle: {
      backgroundColor: "#24292e",
      border: "1px solid #24292e",
      color: "#fff",
    },
  },
]

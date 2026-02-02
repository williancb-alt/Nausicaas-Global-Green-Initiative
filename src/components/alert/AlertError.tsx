import React, { JSX } from "react"

type Props = {
  error?: unknown
  fallback?: string
  className?: string
}

export function AlertError({ error, fallback = "An error occurred", className }: Props): JSX.Element {
  const message =
    typeof error === "string"
      ? error
      : error instanceof Error
      ? error.message
      : (error as any)?.message ?? fallback

  return (
    <div className={`alert alert-danger ${className ?? ""}`} role="alert">
      {message || fallback}
    </div>
  )
}
import { JSX } from "react"

interface AlertErrorProps {
  error: unknown
  fallback?: string
}

export function AlertError({
  error,
  fallback = "An error occurred",
}: AlertErrorProps): JSX.Element | null {
  if (!error) return null

  const message = error instanceof Error ? error.message : fallback

  return (
    <div className="alert alert-danger" role="alert">
      {message}
    </div>
  )
}

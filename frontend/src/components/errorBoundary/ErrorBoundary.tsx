import * as Sentry from "@sentry/react"
import { ReactNode } from "react"

const ErrorFallback: Sentry.FallbackRender = errorData => {
  return (
    <div className="container mt-5">
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Something went wrong</h4>
        <p>An unexpected error occurred. Please try refreshing the page.</p>
        <hr />
        <button
          className="btn btn-outline-danger"
          onClick={() => errorData.resetError()}
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback} showDialog>
      {children}
    </Sentry.ErrorBoundary>
  )
}

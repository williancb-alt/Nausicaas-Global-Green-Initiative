import type { JSX } from "react"

export function GrantApplicationLoadingView(): JSX.Element {
  return (
    <div
      className="container py-5 text-center"
      style={{ minHeight: "100vh", backgroundColor: "#eef7ee" }}
    >
      <div className="spinner-border text-success" role="status">
        <span className="visually-hidden">Loading grant details...</span>
      </div>
      <p className="mt-3 text-muted">Loading grant details...</p>
    </div>
  )
}

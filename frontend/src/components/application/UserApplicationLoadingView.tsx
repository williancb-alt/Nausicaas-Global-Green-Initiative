import type { JSX } from "react"

export function UserApplicationLoadingView(): JSX.Element {
  return (
    <div
      style={{ backgroundColor: "#eef7ee", minHeight: "100vh" }}
      className="py-4"
    >
      <div className="container">
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading application details...</p>
        </div>
      </div>
    </div>
  )
}

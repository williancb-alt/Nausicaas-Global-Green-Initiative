import type { JSX } from "react"
import { Button } from "../button/Button"

interface GrantApplicationErrorViewProps {
  onReturnHome: () => void
}

export function GrantApplicationErrorView({
  onReturnHome,
}: GrantApplicationErrorViewProps): JSX.Element {
  return (
    <div
      className="container py-5"
      style={{ minHeight: "100vh", backgroundColor: "#eef7ee" }}
    >
      <div className="alert alert-danger" role="alert">
        Unable to load grant details. The grant may not exist.
      </div>
      <Button variant="secondary" onClick={onReturnHome}>
        Return to Home
      </Button>
    </div>
  )
}

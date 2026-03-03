import { JSX } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../button/Button"

interface GrantApplicationSuccessViewProps {
  grantName: string
  userEmail?: string
  onReturnHome: () => void
}

export function GrantApplicationSuccessView({
  grantName,
  userEmail,
  onReturnHome,
}: GrantApplicationSuccessViewProps): JSX.Element {
  const navigate = useNavigate()

  return (
    <div
      className="container py-5"
      style={{ minHeight: "100vh", backgroundColor: "#eef7ee" }}
    >
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div
            className="card"
            style={{ border: "2px solid #3b7a57", borderRadius: "8px" }}
          >
            <div
              className="card-header text-center"
              style={{ backgroundColor: "#3b7a57", color: "white" }}
            >
              <h4 className="mb-0">Application Submitted</h4>
            </div>
            <div className="card-body text-center py-5">
              <div
                className="mb-4"
                style={{ fontSize: "4rem", color: "#3b7a57" }}
              >
                &#10003;
              </div>
              <h5 className="mb-3">Thank you for your application!</h5>
              <p className="text-muted mb-4">
                Your application for <strong>{grantName}</strong> has been
                submitted successfully. We will review your application and
                contact you at {userEmail || "your email"}.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Button variant="success" onClick={onReturnHome}>
                  Return to Home
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => void navigate("/dashboard")}
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

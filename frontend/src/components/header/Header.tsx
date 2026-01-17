import { JSX } from "react"
import { Link } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { useLogout } from "../../hooks/useAuthHooks"
import { Button } from "../button/Button"
import { BUTTON_TEXT } from "../../utils/constants"

export function Header(): JSX.Element {
  const { isAuthenticated, user } = useAuthStore()
  const logoutMutation = useLogout()

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  return (
    <header
      style={{
        width: "100%",
        maxHeight: "104px",
        backgroundColor: "var(--header-bg)",
      }}
      className="d-flex align-items-center p-4"
    >
      <div className="w-100">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <Link to="/" className="text-decoration-none">
              {/* TODO - replace with actual logo */}
              <div
                style={{
                  width: "75px",
                  height: "75px",
                  borderRadius: "50%",
                  backgroundColor: "#7B9A82",
                }}
              />
            </Link>
          </div>
          <nav>
            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-3">
                <Button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  variant="primary"
                >
                  {logoutMutation.isPending
                    ? BUTTON_TEXT.LOGGING_OUT
                    : BUTTON_TEXT.LOGOUT}
                </Button>
              </div>
            ) : (
              // TODO - what should be shown if not authenticated
              <></>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

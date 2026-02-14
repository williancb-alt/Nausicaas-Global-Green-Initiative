import { JSX } from "react"
import { useNavigate } from "react-router-dom"
import { useLogout } from "../../hooks/useAuthHooks"

export function LogoutButton(): JSX.Element {
  const navigate = useNavigate()
  const logoutMutation = useLogout()

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        void navigate("/")
      },
    })
  }

  return (
    <button
      className="nav-link btn btn-link"
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
      style={{ cursor: "pointer" }}
    >
      {logoutMutation.isPending ? "Logging out..." : "Logout"}
    </button>
  )
}

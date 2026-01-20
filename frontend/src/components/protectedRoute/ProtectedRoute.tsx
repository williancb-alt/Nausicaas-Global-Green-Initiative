import { useUser } from "../../hooks/useAuthHooks"
import { JSX } from "react"
import { Navigate } from "react-router-dom"

interface ProtectedRouteProps {
  children: JSX.Element
}

export function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const { data: user, isLoading, isError } = useUser()

  if (isLoading) {
    // TODO - implement proper spinner component
    return <div>Loading...</div>
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />
  }

  return children
}

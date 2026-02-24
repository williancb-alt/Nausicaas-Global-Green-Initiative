import { JSX, ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useUser } from "../../hooks/useAuthHooks"

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps): JSX.Element {
  const { data: user, isLoading, isError } = useUser()

  // Show loading state while checking authentication
  if (isLoading) {
    // TODO - implement proper spinner component
    return <div>Loading...</div>
  }

  // Not authenticated - redirect to login
  if (isError || !user) {
    return <Navigate to="/login" replace />
  }

  // Authenticated but need admin and user is not admin - redirect to home
  if (requireAdmin && !user.admin) {
    return <Navigate to="/" replace />
  }

  // All checks passed - render children
  return <>{children}</>
}

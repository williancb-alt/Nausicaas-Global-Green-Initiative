import { JSX, ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps): JSX.Element {
  const { isAuthenticated, user } = useAuthStore()

  // Not logged in at all - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Logged in but need admin and user is not admin - redirect to home
  if (requireAdmin && user && !user.admin) {
    return <Navigate to="/" replace />
  }

  // All checks passed - render children
  return <>{children}</>
}

import { useAuthStore } from "../../store/authStore";
//import { JSX, use } from "react"
import { Navigate } from "react-router-dom"

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (adminOnly && !user?.admin) {
    return <Navigate to="/applications" replace />;
  }

  return <>{children}</>;
}

import { ProtectedRoute } from "./components/protectedRoute/ProtectedRoute"
import { ForgotPassword } from "./pages/ForgotPassword"
import Dashboard  from "./pages/Dashboard"
import { Home } from "./pages/Home"
import { Login } from "./pages/Login"
import { Signup } from "./pages/Signup"
import { AuditLogs } from "./pages/AuditLogs"

export const routes = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/admin/audit",
    element: (
      <ProtectedRoute>
        <AuditLogs />
      </ProtectedRoute>
    ),
  },
]

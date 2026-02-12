import { ProtectedRoute } from "./components/protectedRoute/ProtectedRoute"
import { ForgotPassword } from "./pages/ForgotPassword"
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
    path: "/audit-logs",
    element: (
      <ProtectedRoute requireAdmin={true}>
        {" "}
        {/* ← Only admins can access */}
        <AuditLogs />
      </ProtectedRoute>
    ),
  },
]

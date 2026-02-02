import { ProtectedRoute } from "./components/protectedRoute/ProtectedRoute"
import { ForgotPassword } from "./pages/ForgotPassword"
import { Home } from "./pages/Home"
import { Login } from "./pages/Login"
import { Signup } from "./pages/Signup"
import { Applications } from "./pages/Applications"
import { AdminDashboardPage } from "./pages/AdminDashboardPage"
import { AdminApplicationView } from "./pages/AdminApplicationView"
import { GrantManagementPage } from "./pages/GrantManagementPage"

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
    path: "/applications",
    element: (
      <ProtectedRoute>
        <Applications />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/applications",
    element: (
      <ProtectedRoute>
        <Applications />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/applications/:id",
    element: (
      <ProtectedRoute>
        <AdminApplicationView />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/grants",
    element: (
      <ProtectedRoute>
        <GrantManagementPage />
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
]

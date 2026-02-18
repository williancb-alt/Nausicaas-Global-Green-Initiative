import { ProtectedRoute } from "./components/protectedRoute/ProtectedRoute"
import { ForgotPassword } from "./pages/ForgotPassword"
import { Login } from "./pages/Login"
import { Signup } from "./pages/Signup"
import { Applications } from "./pages/Applications"
import { AdminDashboardPage } from "./pages/AdminDashboardPage"
import { AdminApplicationView } from "./pages/AdminApplicationView"
import { GrantManagementPage } from "./pages/GrantManagementPage"
import { LandingPage } from "./pages/LandingPage"
import { GrantApplicationPage } from "./pages/GrantApplicationPage"
import { AuditLogs } from "./pages/AuditLogs"
import { UserDashboard } from "./pages/UserDashboard"


export const routes = [
  {
    path: "/",
    element: <LandingPage />,
  },

  {
    path: "/grants/:grantName/apply",
    element: (
      <ProtectedRoute>
        <GrantApplicationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/applications",
    element: (
      <ProtectedRoute>
        <UserDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute adminOnly={true}>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/applications",
    element: (
      <ProtectedRoute adminOnly={true}>
        <Applications />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/applications/:id",
    element: (
      <ProtectedRoute adminOnly={true}>
        <AdminApplicationView />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/grants",
    element: (
      <ProtectedRoute adminOnly={true}>
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
  {
    path: "/admin/audit",
    element: (
      <ProtectedRoute adminOnly={true}>
        <AuditLogs />
      </ProtectedRoute>
    ),
  },
]

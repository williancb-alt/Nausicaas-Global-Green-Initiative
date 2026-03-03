import { Navigate } from "react-router-dom"
import { ProtectedRoute } from "./components/protectedRoute/ProtectedRoute"
import { ForgotPassword } from "./pages/ForgotPassword"
import { Login } from "./pages/Login"
import { Signup } from "./pages/Signup"
import { Applications } from "./pages/Applications"
import { MyApplications } from "./pages/MyApplications"
import { UserApplicationView } from "./pages/UserApplicationView"
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
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <UserDashboard />
      </ProtectedRoute>
    ),
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
        <MyApplications />
      </ProtectedRoute>
    ),
  },
  {
    path: "/applications/:id",
    element: (
      <ProtectedRoute>
        <UserApplicationView />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requireAdmin>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/applications",
    element: (
      <ProtectedRoute requireAdmin>
        <Applications />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/applications/:id",
    element: (
      <ProtectedRoute requireAdmin>
        <AdminApplicationView />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/grants",
    element: (
      <ProtectedRoute requireAdmin>
        <GrantManagementPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/audit",
    element: (
      <ProtectedRoute requireAdmin>
        <AuditLogs />
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
    path: "*",
    element: <Navigate to="/" replace />,
  },
]

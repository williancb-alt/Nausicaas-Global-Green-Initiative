import { ProtectedRoute } from "./components/protectedRoute/ProtectedRoute"
import { ForgotPassword } from "./pages/ForgotPassword"
import { Login } from "./pages/Login"
import { Signup } from "./pages/Signup"
import { Applications } from "./pages/Applications"
import { MyApplications } from "./pages/MyApplications"
import { AdminDashboardPage } from "./pages/AdminDashboardPage"
import { AdminApplicationView } from "./pages/AdminApplicationView"
import { GrantManagementPage } from "./pages/GrantManagementPage"
import { LandingPage } from "./pages/LandingPage"
import { GrantApplicationPage } from "./pages/GrantApplicationPage"
import { AuditLogs } from "./pages/AuditLogs"
import { UserDashboard } from "./pages/UserDashboard"
import { useAuthStore } from "./store/authStore"


export const routes = [
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/userdashboard",
    element: (
      <ProtectedRoute>
        <UserDashboard 
          onLogout={() => {
            useAuthStore.getState().clearAuth();
            window.location.href = '/login';  // Simple redirect
          }}
          onNewApplication={() => window.location.href = '/grants/demo/apply'}
          onViewApplication={(id: number) => window.location.href = `/applications/${id}`}
        />
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
  {
    path: "/admin/audit",
    element: (
      <ProtectedRoute>
        <AuditLogs />
      </ProtectedRoute>
    ),
  },
]

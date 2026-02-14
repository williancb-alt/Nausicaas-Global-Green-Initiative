// =============================================================================
// TODO: F-HIGH-2 — Add Admin Role Guard to Admin Routes
// =============================================================================
//
// ISSUE:
//   All admin routes (/admin, /admin/applications, /admin/applications/:id,
//   /admin/grants, /admin/audit) currently use the same <ProtectedRoute>
//   wrapper as regular user routes. ProtectedRoute only checks whether the
//   user is authenticated — it does NOT check whether the user is an admin.
//   This means any logged-in user can navigate to admin pages and see the
//   admin UI. The backend enforces permissions, but the frontend should also
//   guard these routes.
//
// FIX:
//   Create an <AdminRoute> component (similar to ProtectedRoute) that:
//     1. Checks if the user is authenticated (redirect to /login if not)
//     2. Checks if user.admin is true (redirect to / if not)
//
//   Then replace <ProtectedRoute> with <AdminRoute> in routes.tsx for all
//   admin paths.
//
// EXAMPLE IMPLEMENTATION:
//
//   import { useUser } from "../../hooks/useAuthHooks"
//   import { JSX } from "react"
//   import { Navigate } from "react-router-dom"
//
//   interface AdminRouteProps {
//     children: JSX.Element
//   }
//
//   export function AdminRoute({ children }: AdminRouteProps): JSX.Element {
//     const { data: user, isLoading, isError } = useUser()
//
//     if (isLoading) {
//       return <div>Loading...</div>
//     }
//
//     if (isError || !user) {
//       return <Navigate to="/login" replace />
//     }
//
//     if (!user.admin) {
//       return <Navigate to="/" replace />
//     }
//
//     return children
//   }
//
// ROUTES.TSX CHANGES NEEDED:
//   Replace <ProtectedRoute> with <AdminRoute> for these paths:
//     - /admin
//     - /admin/applications
//     - /admin/applications/:id
//     - /admin/grants
//     - /admin/audit
//
// =============================================================================

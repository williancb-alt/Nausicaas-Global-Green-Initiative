# Current Routes

| Route | Page | Frontend Auth | Backend Auth |
|-------|------|---------------|--------------|
| `/` | LandingPage | None (public) | N/A |
| `/login` | Login | None (public) | N/A |
| `/signup` | Signup | None (public) | N/A |
| `/forgot-password` | ForgotPassword | None (public) | N/A |
| `/grants/:grantName/apply` | GrantApplicationPage | `ProtectedRoute` (authenticated) | `@token_required` |
| `/applications` | MyApplications | `ProtectedRoute` (authenticated) | `@token_required` |
| `/applications/:id` | UserApplicationView | `ProtectedRoute` (authenticated) | `@token_required` |
| `/admin` | AdminDashboardPage | `ProtectedRoute` (authenticated) | `@admin_token_required` |
| `/admin/applications` | Applications | `ProtectedRoute` (authenticated) | `@admin_token_required` |
| `/admin/applications/:id` | AdminApplicationView | `ProtectedRoute` (authenticated) | `@admin_token_required` |
| `/admin/grants` | GrantManagementPage | `ProtectedRoute` (authenticated) | `@admin_token_required` |
| `/admin/audit` | AuditLogs | `ProtectedRoute` (authenticated) | `@admin_token_required` |

All `/admin/*` routes are secured on the backend via `@admin_token_required`, which validates the JWT and checks the admin flag, returning 403 if the user is not an admin. However, on the frontend, these same routes only use `ProtectedRoute`, which checks authentication but not admin status — meaning a logged-in non-admin user can navigate to admin pages and see the UI shell (though API calls will fail). An `AdminRoute` wrapper that also checks `user.admin` has been outlined in `TODO_AdminRoute.tsx` and will be implemented. Additionally, there is currently no catch-all `*` route, so any undefined path (e.g. `/dashboard`, `/eggs`) will render the site header and navbar with an empty content area rather than a 404 page or redirect — this will also be rectified.

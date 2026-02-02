import { JSX } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { useLogout } from "../hooks/useAuthHooks"
import { useApplications } from "../hooks/useApplicationHooks"
import { AdminDashboard } from "./AdminDashboard"

export function AdminDashboardPage(): JSX.Element {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const logoutMutation = useLogout()

  const { data: applicationsData } = useApplications()

  const userProp = {
    // AdminDashboard expects a LoginCredentials-like object but only uses email.
    email: user?.email ?? "",
    password: "",
  }

  const handleLogout = () => {
    logoutMutation.mutate()
    navigate("/login")
  }

  const handleViewApplication = (applicationId: string) => {
    navigate(`/admin/applications/${applicationId}`)
  }

  const handleManageGrants = () => {
    navigate("/admin/grants")
  }

  const applications = applicationsData?.items ?? []

  return (
    <AdminDashboard
      user={userProp}
      applications={applications}
      grants={[]}
      onLogout={handleLogout}
      onViewApplication={handleViewApplication}
      onManageGrants={handleManageGrants}
    />
  )
}

export default AdminDashboardPage

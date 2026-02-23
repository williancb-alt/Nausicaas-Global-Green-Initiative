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
    email: user?.email ?? "",
    password: "",
  }

  const handleLogout = () => {
    logoutMutation.mutate()
    void navigate("/login")
  }

  const handleManageGrants = () => {
    void navigate("/admin/grants")
  }

  const handleViewAuditLogs = () => {
    void navigate("/admin/audit")
  }

  const handleViewApplication = (applicationId: number) => {
    void navigate(`/admin/applications/${applicationId}`)
  }

  return (
    <AdminDashboard
      user={userProp}
      applications={applicationsData?.items ?? []}
      grants={[]}
      onLogout={handleLogout}
      onViewApplication={handleViewApplication}
      onManageGrants={handleManageGrants}
      onViewAuditLogs={handleViewAuditLogs}
    />
  )
}
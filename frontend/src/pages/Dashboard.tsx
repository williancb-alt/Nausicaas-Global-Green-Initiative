import { JSX } from "react"
import { useAuthStore } from "../store/authStore"
import { api } from "../services/api"
import {
  DashboardLoading,
  DashboardError,
} from "../components/dashboard/DashboardHelpers"
import {
  DashboardHeader,
  GrantCard,
} from "../components/dashboard/DashboardComponents"
import { useDashboardData } from "../hooks/useDashboardData"

/**
 * Main Dashboard component.
 * Uses useDashboardData hook for state and fetching.
 */
const Dashboard = (): JSX.Element => {
  const { user } = useAuthStore()
  const { availableGrants, myApps, loading, error } = useDashboardData(user)

  const handleLogout = async () => {
    await api.auth.logout()
    window.location.href = "/login"
  }

  if (loading) return <DashboardLoading />
  if (error) return <DashboardError error={error} />

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <DashboardHeader
        userEmail={user?.email || user?.public_id || "User"}
        grantCount={availableGrants.length}
        appCount={myApps.count}
        onLogout={() => void handleLogout()}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {availableGrants.length > 0 ? (
          availableGrants.map(grant => (
            <GrantCard key={grant.name} grant={grant} />
          ))
        ) : (
          <div
            style={{
              gridColumn: "1 / -1",
              padding: "20px",
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            No grants available right now. Check back later!
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

import { useState, useEffect, JSX } from "react"
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

interface Grant {
  name: string
  deadline: string
  deadline_passed: boolean
  time_remaining: string
}

const Dashboard = (): JSX.Element => {
  const authStore = useAuthStore()
  const user = authStore.user
  const [availableGrants, setAvailableGrants] = useState<Grant[]>([])
  const [myApps, setMyApps] = useState({ count: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogout = async () => {
    await api.auth.logout()
    window.location.href = "/login"
  }

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        const grantResponse = await api.grants.listGrants(1, 10)
        const grants = (grantResponse.items as Grant[]).filter(
          g => !g.deadline_passed,
        )
        setAvailableGrants(grants)
        setMyApps({ count: 2 })
      } catch (err: unknown) {
        console.error(err)
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      void loadDashboardData()
    }
  }, [user])

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

import { useState, useEffect } from "react"
import { api } from "../services/api"
import { getMonitoring } from "../services/monitoring"
import type { UserInfo } from "../services/api/client"

export interface Grant {
  name: string
  deadline: string
  deadline_passed: boolean
  time_remaining: string
}

export function useDashboardData(user: UserInfo | null) {
  const [availableGrants, setAvailableGrants] = useState<Grant[]>([])
  const [myApps, setMyApps] = useState({ count: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        const grantResponse = await api.grants.listGrants(1, 10)
        const grants = (grantResponse.items as Grant[]).filter(
          g => !g.deadline_passed,
        )
        setAvailableGrants(grants)
        const appResponse = await api.applications.getMyApplications(1, 1)
        setMyApps({ count: appResponse.total_items })
      } catch (err: unknown) {
        getMonitoring().captureException(err, { context: "dashboard.loadData" })
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      void loadDashboardData()
    }
  }, [user])

  return {
    availableGrants,
    myApps,
    loading,
    error,
  }
}

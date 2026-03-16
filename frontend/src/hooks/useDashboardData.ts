import { useState, useEffect } from "react"
import { api } from "../services/api"
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

  return {
    availableGrants,
    myApps,
    loading,
    error,
  }
}

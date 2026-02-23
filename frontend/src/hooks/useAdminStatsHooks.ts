import { Application } from "@/types"
import { useMemo } from "react"

export function useAdminStats(applications: Application[]) {
  const stats = useMemo(() => {
    const total = applications.length
    const approved = applications.filter(
      app => app.status === "approved",
    ).length
    const rejected = applications.filter(app => app.status === "denied").length
    const pending = applications.filter(
      app => app.status === "pending_review" || app.status === "in_review",
    ).length
    return { total, approved, rejected, pending }
  }, [applications])

  const statusChartData = useMemo(
    () => [
      { name: "Approved", value: stats.approved, color: "#3b7a57" },
      { name: "Rejected", value: stats.rejected, color: "#ef4444" },
      { name: "Pending Review", value: stats.pending, color: "#f59e0b" },
    ],
    [stats],
  )

  const grantWiseData = useMemo(() => {
    const grantMap = new Map<string, number>()

    applications.forEach(app => {
      const grantName = app.grant.name
      grantMap.set(grantName, (grantMap.get(grantName) || 0) + 1)
    })

    return Array.from(grantMap.entries()).map(([name, count]) => ({
      name,
      applications: count,
    }))
  }, [applications])

  return { stats, statusChartData, grantWiseData }
}

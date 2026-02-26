import { useState, useMemo } from "react"
import { Application, LoginCredentials } from "../types/index"
import { StatCard } from "../components/card/StatsCard"
import { ApplicationStatusFilterBar } from "../components/filter/ApplicationStatusFilterBar"
import { AdminDashboardApplicationsTable } from "../components/table/AdminDashboardApplicationsTable"
import { filterApplications } from "../utils/applications"
import { AdminDashboardHeader } from "../components/header/AdminDashboardHeader"
import { useAdminStats } from "../hooks/useAdminStatsHooks"
import { ApplicationStatusChart } from "../components/chart/ApplicationStatusChart"
import { GrantDistributionChart } from "../components/chart/GrantDistributionChart"

interface AdminDashboardProps {
  user: LoginCredentials
  applications: Application[]
  grants: Application[]
  onLogout: () => void
  onViewApplication: (applicationId: number) => void
  onManageGrants: () => void
  onViewAuditLogs: () => void
}

export function AdminDashboard({
  user,
  applications,
  onLogout,
  onViewApplication,
  onManageGrants,
  onViewAuditLogs,
}: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<
    "all" | Application["status"]
  >("all")

  const { stats, statusChartData, grantWiseData } = useAdminStats(applications)

  const filteredApplications = useMemo(
    () => filterApplications(applications, searchTerm, statusFilter),
    [applications, searchTerm, statusFilter],
  )

  return (
    <div style={{ backgroundColor: "#eef7ee", minHeight: "100vh" }}>
      {/* Header */}
      <AdminDashboardHeader
        userEmail={user.email}
        onManageGrants={onManageGrants}
        onViewAuditLogs={onViewAuditLogs}
        onLogout={onLogout}
      />

      <div className="container-fluid py-5">
        {/* Stats Overview */}
        <div className="row mb-5 g-4">
          <StatCard
            label="Total Applications"
            value={stats.total}
            subtext="submissions received"
            accentColor="#3b82f6"
          />
          <StatCard
            label="Approved"
            value={stats.approved}
            subtext={
              stats.total > 0
                ? `${((stats.approved / stats.total) * 100).toFixed(0)}% of total`
                : "0% of total"
            }
            accentColor="#3b7a57"
          />
          <StatCard
            label="Rejected"
            value={stats.rejected}
            subtext={
              stats.total > 0
                ? `${((stats.rejected / stats.total) * 100).toFixed(0)}% of total`
                : "0% of total"
            }
            accentColor="#ef4444"
            valueColor="#dc2626"
          />
          <StatCard
            label="Under Review"
            value={stats.pending}
            subtext={
              stats.total > 0
                ? `${((stats.pending / stats.total) * 100).toFixed(0)}% of total`
                : "0% of total"
            }
            accentColor="#f59e0b"
            valueColor="#d97706"
          />
        </div>

        {/* Charts Section */}
        <div className="row mb-5 g-4">
          <ApplicationStatusChart data={statusChartData} />
          <GrantDistributionChart data={grantWiseData} />
        </div>

        {/* Applications Management */}
        <div
          className="card"
          style={{ borderRadius: "8px", borderTop: "4px solid #3b7a57" }}
        >
          <div
            className="card-header"
            style={{
              backgroundColor: "#eef7ee",
              borderBottom: "1px solid #e6f4e8",
            }}
          >
            <h5
              className="card-title mb-0"
              style={{ color: "#2f6f44", fontWeight: "600" }}
            >
              Applications
            </h5>
          </div>
          <div className="card-body">
            <ApplicationStatusFilterBar
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
            />

            <AdminDashboardApplicationsTable
              applications={filteredApplications}
              onViewApplication={onViewApplication}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

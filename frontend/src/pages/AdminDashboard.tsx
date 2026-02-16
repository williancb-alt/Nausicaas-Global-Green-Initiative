import { useState, useMemo } from "react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Application, LoginCredentials } from "../types/index"
import { StatCard } from "../components/card/StatsCard"
import { ApplicationStatusFilterBar } from "../components/filter/ApplicationStatusFilterBar"
import { AdminDashboardApplicationsTable } from "../components/table/AdminDashboardApplicationsTable"
import { filterApplications } from "../utils/applications"
import { AdminDashboardHeader } from "../components/header/AdminDashboardHeader"
import { ChartCard } from "../components/card/ChartCard"

interface AdminDashboardProps {
  user: LoginCredentials
  applications: Application[]
  grants: Application[]
  onLogout: () => void
  onViewApplication: (applicationId: number) => void
  onManageGrants: () => void
}

export function AdminDashboard({
  user,
  applications,
  onLogout,
  onViewApplication,
  onManageGrants,
}: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<
    "all" | Application["status"]
  >("all")

  // Calculate statistics
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

  // Prepare chart data
  const statusChartData = useMemo(
    () => [
      { name: "Approved", value: stats.approved, color: "#3b7a57" },
      { name: "Rejected", value: stats.rejected, color: "#ef4444" },
      { name: "Pending Review", value: stats.pending, color: "#f59e0b" },
    ],
    [stats],
  )

  // Grant-wise application data
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
          {/* Status Distribution */}
          <div className="col-12 col-lg-6">
            <ChartCard title="Application Status Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({
                      name,
                      percent,
                    }: { name?: string; percent?: number } = {}): string => {
                      return `${name || "N/A"}: ${((percent || 0) * 100).toFixed(0)}%`
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Grant-wise Applications */}
          <div className="col-12 col-lg-6">
            <ChartCard title="Applications by Grant">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={grantWiseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6f4e8" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="applications"
                    fill="#3b7a57"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
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

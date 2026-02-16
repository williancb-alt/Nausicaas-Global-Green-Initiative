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
      <header
        style={{ backgroundColor: "#2f6f44", color: "white" }}
        className="border-bottom"
      >
        <div className="container-fluid py-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0 fw-bold">Admin Dashboard</h1>
              <p className="mb-0 mt-2" style={{ opacity: 0.9 }}>
                Welcome back, {user.email}
              </p>
            </div>
            <div className="d-flex gap-3">
              <button
                onClick={onManageGrants}
                className="btn"
                style={{
                  backgroundColor: "white",
                  color: "#3b7a57",
                  fontWeight: "500",
                }}
              >
                Manage Grants
              </button>
              <button onClick={onLogout} className="btn btn-outline-light">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

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
                  Application Status Distribution
                </h5>
              </div>
              <div className="card-body">
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
              </div>
            </div>
          </div>

          {/* Grant-wise Applications */}
          <div className="col-12 col-lg-6">
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
                  Applications by Grant
                </h5>
              </div>
              <div className="card-body">
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
              </div>
            </div>
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

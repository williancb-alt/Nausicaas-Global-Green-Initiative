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
import { FileText, Search } from "lucide-react"
import { Application, LoginCredentials } from "../types/index"

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

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch =
        searchTerm === "" ||
        String(app.id).includes(searchTerm) ||
        app.applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.grant.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === "all" || app.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [applications, searchTerm, statusFilter])

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
          <div className="col-12 col-md-6 col-lg-3">
            <div
              className="card h-100"
              style={{ borderTop: "4px solid #3b82f6", borderRadius: "8px" }}
            >
              <div className="card-body">
                <p className="text-muted mb-2">Total Applications</p>
                <h2
                  className="fw-bold"
                  style={{ color: "#2f6f44", fontSize: "2.5rem" }}
                >
                  {stats.total}
                </h2>
                <small className="text-muted">submissions received</small>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div
              className="card h-100"
              style={{ borderTop: "4px solid #3b7a57", borderRadius: "8px" }}
            >
              <div className="card-body">
                <p className="text-muted mb-2">Approved</p>
                <h2
                  className="fw-bold"
                  style={{ color: "#2f6f44", fontSize: "2.5rem" }}
                >
                  {stats.approved}
                </h2>
                <small className="text-muted">
                  {stats.total > 0
                    ? ((stats.approved / stats.total) * 100).toFixed(0)
                    : 0}
                  % of total
                </small>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div
              className="card h-100"
              style={{ borderTop: "4px solid #ef4444", borderRadius: "8px" }}
            >
              <div className="card-body">
                <p className="text-muted mb-2">Rejected</p>
                <h2
                  className="fw-bold"
                  style={{ color: "#dc2626", fontSize: "2.5rem" }}
                >
                  {stats.rejected}
                </h2>
                <small className="text-muted">
                  {stats.total > 0
                    ? ((stats.rejected / stats.total) * 100).toFixed(0)
                    : 0}
                  % of total
                </small>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div
              className="card h-100"
              style={{ borderTop: "4px solid #f59e0b", borderRadius: "8px" }}
            >
              <div className="card-body">
                <p className="text-muted mb-2">Under Review</p>
                <h2
                  className="fw-bold"
                  style={{ color: "#d97706", fontSize: "2.5rem" }}
                >
                  {stats.pending}
                </h2>
                <small className="text-muted">
                  {stats.total > 0
                    ? ((stats.pending / stats.total) * 100).toFixed(0)
                    : 0}
                  % of total
                </small>
              </div>
            </div>
          </div>
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
            <div className="row mb-4 g-3">
              <div className="col-auto">
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn ${statusFilter === "all" ? "btn" : "btn-outline"}`}
                    style={{
                      backgroundColor:
                        statusFilter === "all" ? "#3b7a57" : "transparent",
                      color: statusFilter === "all" ? "white" : "#3b7a57",
                      borderColor: "#3b7a57",
                    }}
                    onClick={() => setStatusFilter("all")}
                  >
                    All Applications
                  </button>
                  <button
                    type="button"
                    className={`btn ${statusFilter === "pending_review" ? "btn" : "btn-outline"}`}
                    style={{
                      backgroundColor:
                        statusFilter === "pending_review"
                          ? "#3b7a57"
                          : "transparent",
                      color:
                        statusFilter === "pending_review" ? "white" : "#3b7a57",
                      borderColor: "#3b7a57",
                    }}
                    onClick={() =>
                      setStatusFilter("pending_review" as Application["status"])
                    }
                  >
                    Pending Review
                  </button>
                  <button
                    type="button"
                    className={`btn ${statusFilter === "approved" ? "btn" : "btn-outline"}`}
                    style={{
                      backgroundColor:
                        statusFilter === "approved" ? "#3b7a57" : "transparent",
                      color: statusFilter === "approved" ? "white" : "#3b7a57",
                      borderColor: "#3b7a57",
                    }}
                    onClick={() =>
                      setStatusFilter("approved" as Application["status"])
                    }
                  >
                    Approved
                  </button>
                  <button
                    type="button"
                    className={`btn ${statusFilter === "denied" ? "btn" : "btn-outline"}`}
                    style={{
                      backgroundColor:
                        statusFilter === "denied" ? "#3b7a57" : "transparent",
                      color: statusFilter === "denied" ? "white" : "#3b7a57",
                      borderColor: "#3b7a57",
                    }}
                    onClick={() =>
                      setStatusFilter("denied" as Application["status"])
                    }
                  >
                    Rejected
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="col">
                <div className="input-group">
                  <span
                    className="input-group-text"
                    style={{
                      backgroundColor: "#eef7ee",
                      borderColor: "#e6f4e8",
                    }}
                  >
                    <Search size={18} style={{ color: "#3b7a57" }} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by ID, email or grant..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="form-control"
                    style={{ borderColor: "#d1fae5" }}
                  />
                </div>
              </div>
            </div>

            <ApplicationsTable
              applications={filteredApplications}
              onViewApplication={onViewApplication}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Applications Table Component
function ApplicationsTable({
  applications,
  onViewApplication,
}: {
  applications: Application[]
  onViewApplication: (id: number) => void
}) {
  if (applications.length === 0) {
    return (
      <div className="text-center py-5">
        <FileText
          size={48}
          style={{ color: "#e6f4e8" }}
          className="mb-3 mx-auto d-block"
        />
        <p className="text-muted">No applications found</p>
      </div>
    )
  }

  return (
    <table className="table table-hover">
      <thead style={{ backgroundColor: "#eef7ee" }}>
        <tr>
          <th style={{ color: "#2f6f44", fontWeight: "600" }}>ID</th>
          <th style={{ color: "#2f6f44", fontWeight: "600" }}>Applicant</th>
          <th style={{ color: "#2f6f44", fontWeight: "600" }}>Grant</th>
          <th style={{ color: "#2f6f44", fontWeight: "600" }}>Submitted</th>
          <th style={{ color: "#2f6f44", fontWeight: "600" }}>Status</th>
          <th style={{ color: "#2f6f44", fontWeight: "600" }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {applications.map(app => (
          <tr key={app.id} style={{ borderColor: "#f0fdf4" }}>
            <td>
              <code style={{ color: "#3b7a57", fontWeight: "600" }}>
                {app.id}
              </code>
            </td>
            <td style={{ color: "#047857", fontWeight: "500" }}>
              {app.applicant.email}
            </td>
            <td>{app.grant.name}</td>
            <td className="text-muted">{app.submitted_date}</td>
            <td>
              <span
                className="badge"
                style={{
                  backgroundColor:
                    app.status === "approved"
                      ? "#eef7ee"
                      : app.status === "denied"
                        ? "#fee2e2"
                        : "#fff4e6",
                  color:
                    app.status === "approved"
                      ? "#2f6f44"
                      : app.status === "denied"
                        ? "#dc2626"
                        : "#d97706",
                  padding: "0.5rem 0.75rem",
                }}
              >
                {app.status === "approved" && "Approved"}
                {app.status === "denied" && "Denied"}
                {app.status === "pending_review" && "Pending Review"}
                {app.status === "in_review" && "In Review"}
              </span>
            </td>
            <td>
              <button
                onClick={() => onViewApplication(app.id)}
                className="btn btn-sm"
                style={{
                  backgroundColor: "#3b7a57",
                  color: "white",
                  fontWeight: "500",
                }}
              >
                Review
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

import { JSX, useMemo, useState } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import {
  useMyApplications
} from "../hooks/useApplicationHooks"
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Search,
  LayoutDashboard
} from "lucide-react"
import { useAuthStore } from "../store/authStore"

const statusConfig = {
  approved: { label: "Approved", color: "success", icon: CheckCircle2, bg: "#f0fdf4" },
  denied: { label: "Denied", color: "danger", icon: AlertCircle, bg: "#fef2f2" },
  pending_review: { label: "Pending", color: "warning", icon: Clock, bg: "#fffbeb" },
  in_review: { label: "In Review", color: "info", icon: Search, bg: "#eff6ff" },
  opened: { label: 'Opened', color: 'primary', icon: FileText, bg: "#f8fafc" },
}

export function UserDashboard(): JSX.Element {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { data: appsData, isLoading, isError } = useMyApplications()

  const [searchTerm, setSearchTerm] = useState("")

  const applications = appsData?.items ?? []

  const stats = useMemo(() => {
    return {
      total: applications.length,
      approved: applications.filter(a => a.status === 'approved').length,
      pending: applications.filter(a => ['pending_review', 'in_review'].includes(a.status)).length,
      denied: applications.filter(a => a.status === 'denied').length,
    }
  }, [applications])

  const filteredApps = useMemo(() => {
    if (!searchTerm) return applications
    return applications.filter(a =>
      a.grant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(a.id).includes(searchTerm)
    )
  }, [applications, searchTerm])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Preparing your dashboard...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <AlertCircle className="me-2" />
          Failed to load dashboard data. Please try again later.
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid px-4 py-4 min-vh-100" style={{ backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1" style={{ color: "#2f6f44" }}>
            Welcome back, {user?.email.split('@')[0]}!
          </h1>
          <p className="text-muted mb-0">Here's an overview of your grant applications</p>
        </div>
        <button
          className="btn btn-success d-flex align-items-center gap-2 px-4 shadow-sm"
          onClick={() => navigate("/")}
          style={{ backgroundColor: "#2f6f44", border: "none" }}
        >
          <Plus size={18} />
          New Application
        </button>
      </div>

      {/* Stats Row */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard
            title="Total Applications"
            value={stats.total}
            icon={<LayoutDashboard size={24} />}
            color="#3b82f6"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard
            title="Approved"
            value={stats.approved}
            icon={<CheckCircle2 size={24} />}
            color="#10b981"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard
            title="Under Review"
            value={stats.pending}
            icon={<Clock size={24} />}
            color="#f59e0b"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCard
            title="Denied"
            value={stats.denied}
            icon={<AlertCircle size={24} />}
            color="#ef4444"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
        <div className="card-header bg-white border-0 py-4 px-4 d-flex justify-content-between align-items-center">
          <h2 className="h5 fw-bold mb-0">Recent Applications</h2>
          <div className="input-group" style={{ maxWidth: "300px" }}>
            <span className="input-group-text bg-light border-0">
              <Search size={16} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control bg-light border-0 shadow-none"
              placeholder="Search by grant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: "0.9rem" }}
            />
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 text-muted fw-semibold" style={{ fontSize: "0.85rem", width: "80px" }}>ID</th>
                  <th className="py-3 text-muted fw-semibold" style={{ fontSize: "0.85rem" }}>Grant Name</th>
                  <th className="py-3 text-muted fw-semibold" style={{ fontSize: "0.85rem" }}>Status</th>
                  <th className="py-3 text-muted fw-semibold" style={{ fontSize: "0.85rem" }}>Submitted Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-5 text-muted">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => {
                    const status = statusConfig[app.status] || statusConfig.pending_review
                    const StatusIcon = status.icon
                    return (
                      <tr key={app.id}>
                        <td className="px-4">
                          <span className="text-primary fw-medium">#{app.id}</span>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{app.grant.name}</div>
                          {app.grant.description && (
                            <div className="text-muted small text-truncate" style={{ maxWidth: "250px" }}>
                              {app.grant.description}
                            </div>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1 text-${status.color}`}
                            style={{ backgroundColor: status.bg, fontSize: "0.75rem" }}
                          >
                            <StatusIcon size={14} />
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <span className="text-muted small">
                            {new Date(app.submitted_date).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        {filteredApps.length > 0 && (
          <div className="card-footer bg-white border-0 py-3 px-4 text-end">
            <small className="text-muted">Showing {filteredApps.length} applications</small>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
      <div className="card-body p-4">
        <div className="d-flex align-items-start justify-content-between mb-3">
          <div
            className="p-3 rounded-3 d-flex align-items-center justify-content-center"
            style={{ backgroundColor: `${color}15`, color: color }}
          >
            {icon}
          </div>
          <p className="h3 fw-bold mb-0">{value}</p>
        </div>
        <h3 className="h6 text-muted fw-semibold mb-0 uppercase mb-1" style={{ letterSpacing: "0.025em" }}>{title}</h3>
      </div>
    </div>
  )
}

export default UserDashboard
import { JSX } from "react"
import { useMyApplications } from "../hooks/useApplicationHooks"
import { useAuthStore } from "../store/authStore"
import { StatCard } from "../components/card/StatsCard"
import { useNavigate } from "react-router-dom"
import { useAdminStats } from "../hooks/useAdminStatsHooks"
import { Application } from "../types"

export function UserDashboard(): JSX.Element {
  const { data: applicationsData, isLoading } = useMyApplications()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const applications = applicationsData?.items ?? []

  const { stats } = useAdminStats(applications)

  const handleApply = () => {
    void navigate("/") // Navigate to landing page to see available grants
  }

  const handleViewDetails = (id: number) => {
    void navigate(`/applications/${id}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "#3b7a57"
      case "denied":
        return "#ef4444"
      case "in_review":
        return "#3b82f6"
      default:
        return "#f59e0b"
    }
  }

  return (
    <div
      style={{ backgroundColor: "#f0fdf4", minHeight: "100vh" }}
      className="pb-5"
    >
      {/* Hero Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #3b7a57 0%, #2d5a41 100%)",
          padding: "3rem 0",
          color: "white",
          marginBottom: "2rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="display-5 fw-bold mb-2">
                Welcome back, {user?.email?.split("@")[0]}!
              </h1>
              <p className="lead opacity-75 mb-0">
                Track your sustainability grant applications and manage your
                impact.
              </p>
            </div>
            <div className="col-md-4 text-md-end mt-4 mt-md-0">
              <button
                onClick={handleApply}
                className="btn btn-light btn-lg px-4 fw-bold"
                style={{
                  color: "#3b7a57",
                  borderRadius: "12px",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.transform = "translateY(-3px)")
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                + Start New Application
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Stats Section */}
        <div className="row mb-5 g-4">
          <StatCard
            label="Total Applications"
            value={stats.total}
            subtext="Tracked submissions"
            accentColor="#3b82f6"
          />
          <StatCard
            label="Approved"
            value={stats.approved}
            subtext="Grants granted"
            accentColor="#3b7a57"
          />
          <StatCard
            label="Under Review"
            value={stats.pending}
            subtext="Processing..."
            accentColor="#f59e0b"
          />
          <StatCard
            label="Rejected"
            value={stats.rejected}
            subtext="Unsuccessful"
            accentColor="#ef4444"
            valueColor="#dc2626"
          />
        </div>

        {/* Applications List */}
        <div
          className="card border-0 shadow-sm"
          style={{ borderRadius: "16px", overflow: "hidden" }}
        >
          <div className="card-header bg-white py-3 border-bottom-0">
            <h2 className="h4 mb-0 fw-bold" style={{ color: "#2d5a41" }}>
              Recent Activity
            </h2>
          </div>
          <div className="card-body p-0">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">
                  You haven't submitted any applications yet.
                </p>
                <button
                  onClick={handleApply}
                  className="btn btn-outline-success"
                >
                  Browse Grants
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3 border-0">Grant Program</th>
                      <th className="py-3 border-0">Submitted On</th>
                      <th className="py-3 border-0">Status</th>
                      <th className="px-4 py-3 border-0 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app: Application) => (
                      <tr key={app.id}>
                        <td className="px-4 py-3 fw-semibold">
                          {app.grant.name}
                        </td>
                        <td className="py-3 text-muted">
                          {app.submitted_date}
                        </td>
                        <td className="py-3">
                          <span
                            className="badge"
                            style={{
                              backgroundColor: `${getStatusColor(app.status)}15`,
                              color: getStatusColor(app.status),
                              padding: "0.5rem 1rem",
                              borderRadius: "8px",
                              textTransform: "capitalize",
                              fontWeight: "600",
                            }}
                          >
                            {app.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <button
                            onClick={() => handleViewDetails(app.id)}
                            className="btn btn-sm btn-light me-2"
                            style={{ borderRadius: "8px" }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface AdminDashboardHeaderProps {
  userEmail: string
  onManageGrants: () => void
  onViewAuditLogs: () => void
  onLogout: () => void
}

export function AdminDashboardHeader({
  userEmail,
  onManageGrants,
  onViewAuditLogs,
  onLogout,
}: AdminDashboardHeaderProps) {
  return (
    <header
      style={{ backgroundColor: "#2f6f44", color: "white" }}
      className="border-bottom"
    >
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h3 mb-0 fw-bold">Admin Dashboard</h1>
            <p className="mb-0 mt-2" style={{ opacity: 0.9 }}>
              Welcome back, {userEmail}
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
            <button
              onClick={onViewAuditLogs}
              className="btn"
              style={{
                backgroundColor: "white",
                color: "#3b7a57",
                fontWeight: "500",
              }}
            >
              Audit Logs
            </button>
            <button onClick={onLogout} className="btn btn-outline-light">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

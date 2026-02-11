import { JSX, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "../services/api"
import { AuditStats } from "../components/audit/AuditStats"
import { AuditFilters } from "../components/audit/AuditFilters"
import { AuditTable } from "../components/audit/AuditTable"
import { AuditDetailModal } from "../components/audit/AuditDetailModal"
import type { AuditLog } from "../services/api/audit"

type AuditTabType = "all" | "grants" | "applications" | "security" | "admins"

export function AuditLogs(): JSX.Element {
  const [activeTab, setActiveTab] = useState<AuditTabType>("grants")
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [_filters, _setFilters] = useState({
    action: "all",
    dateRange: "7days",
    userEmail: "all",
  })

  // Fetch audit logs
  const {
    data: auditData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["auditLogs"],
    queryFn: () => api.audit.getRecentLogs(100),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Filter logs based on active tab
  const getFilteredLogs = (): AuditLog[] => {
    if (!auditData?.logs) return []

    let filtered = [...auditData.logs]

    // Filter by tab
    switch (activeTab) {
      case "grants":
        filtered = filtered.filter(log => log.entity_type === "grant")
        break
      case "applications":
        filtered = filtered.filter(log => log.entity_type === "application")
        break
      case "security":
        filtered = filtered.filter(
          log =>
            log.action === "application_edit_blocked" ||
            log.action === "unauthorized_access" ||
            log.action === "login_failed" ||
            !log.success
        )
        break
      case "admins":
        filtered = filtered.filter(log => log.is_admin)
        break
      case "all":
      default:
        // Show all
        break
    }

    // Additional filters can be applied here based on filters state

    return filtered
  }

  const filteredLogs = getFilteredLogs()

  // Get unique admin emails for filter dropdown
  const adminEmails = Array.from(
    new Set(
      auditData?.logs
        .filter(log => log.is_admin)
        .filter(log => log.user_email !== null).map(log => log.user_email as string) ?? []
    )
  )

  const getTabLabel = (tab: AuditTabType): string => {
    const labels: Record<AuditTabType, string> = {
      all: "All Activity",
      grants: "Grants",
      applications: "Applications",
      security: "Security Events",
      admins: "By Admin",
    }
    return labels[tab]
  }

  const isTabDisabled = (tab: AuditTabType): boolean => {
    // Disable tabs that don't have data yet
    if (tab === "applications" || tab === "security") {
      const hasData = auditData?.logs.some(log => {
        if (tab === "applications") return log.entity_type === "application"
        if (tab === "security")
          return (
            log.action === "application_edit_blocked" ||
            log.action === "unauthorized_access" ||
            !log.success
          )
        return false
      })
      return !hasData
    }
    return false
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🔒 Audit Log Dashboard</h2>
        <button
          className="btn btn-outline-primary"
          onClick={() => void refetch()}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <strong>Error loading audit logs:</strong>{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      )}

      {/* Statistics */}
      {auditData && (
        <AuditStats logs={auditData.logs} timeRange="Last 7 Days" />
      )}

      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-4">
        {(["all", "grants", "applications", "security", "admins"] as AuditTabType[]).map(
          tab => (
            <li key={tab} className="nav-item">
              <button
                className={`nav-link ${activeTab === tab ? "active" : ""} ${
                  isTabDisabled(tab) ? "disabled" : ""
                }`}
                onClick={() => !isTabDisabled(tab) && setActiveTab(tab)}
                disabled={isTabDisabled(tab)}
              >
                {getTabLabel(tab)}
                {isTabDisabled(tab) && (
                  <span className="badge bg-secondary ms-2">Coming Soon</span>
                )}
              </button>
            </li>
          )
        )}
      </ul>

      {/* Info Banner for Current Tab */}
      {activeTab === "grants" && (
        <div className="alert alert-info mb-4" role="alert">
          <strong>📝 Grant Management Activity</strong>
          <p className="mb-0 mt-2">
            Showing all actions related to grant creation, editing, and
            deletion. These logs track which administrators made changes to
            grants in the system.
          </p>
        </div>
      )}

      {activeTab === "applications" && (
        <div className="alert alert-warning mb-4" role="alert">
          <strong>⏳ Coming Soon</strong>
          <p className="mb-0 mt-2">
            Application audit tracking will be available once the application
            submission system is implemented by Ronan (Epic #4).
          </p>
        </div>
      )}

      {activeTab === "security" && (
        <div className="alert alert-warning mb-4" role="alert">
          <strong>⏳ Coming Soon</strong>
          <p className="mb-0 mt-2">
            Security event tracking (unauthorized access attempts, blocked
            edits, failed logins) will be implemented in the next phase.
          </p>
        </div>
      )}

      {/* Filters */}
      {!isTabDisabled(activeTab) && (
        <AuditFilters
          onFilterChange={_setFilters}
          adminEmails={adminEmails}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Audit Table */}
      {!isLoading && !isTabDisabled(activeTab) && (
        <AuditTable logs={filteredLogs} onRowClick={setSelectedLog} />
      )}

      {/* Detail Modal */}
      <AuditDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  )
}
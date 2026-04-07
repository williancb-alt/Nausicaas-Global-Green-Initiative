import { JSX, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "../services/api"
import { AuditStats } from "../components/audit/AuditStats"
import { AuditFilters } from "../components/audit/AuditFilters"
import { AuditTable } from "../components/audit/AuditTable"
import { AuditDetailModal } from "../components/audit/AuditDetailModal"
import type { AuditLog } from "../services/api/audit"

type AuditTabType = "all" | "grants" | "applications" | "security" | "admins"

interface FilterState {
  action: string
  dateRange: string
  userEmail: string
}

const SECURITY_ACTIONS = new Set([
  "application_edit_blocked",
  "unauthorized_access",
  "login_failed",
])

function filterByTab(logs: AuditLog[], tab: AuditTabType): AuditLog[] {
  switch (tab) {
    case "grants":
      return logs.filter(log => log.entity_type === "grant")
    case "applications":
      return logs.filter(log => log.entity_type === "application")
    case "security":
      return logs.filter(
        log => SECURITY_ACTIONS.has(log.action) || !log.success,
      )
    case "admins":
      return logs.filter(log => log.is_admin)
    default:
      return logs
  }
}

function filterByDateRange(logs: AuditLog[], dateRange: string): AuditLog[] {
  if (dateRange === "all") return logs

  const now = new Date()
  let cutoff: Date | null = null

  if (dateRange === "today") {
    cutoff = new Date(now)
    cutoff.setHours(0, 0, 0, 0)
  } else {
    const daysMap: Record<string, number> = {
      "7days": 7,
      "30days": 30,
      "90days": 90,
    }
    const days = daysMap[dateRange]
    if (days !== undefined) {
      cutoff = new Date(now)
      cutoff.setDate(cutoff.getDate() - days)
    }
  }

  if (!cutoff) return logs
  const cutoffDate = cutoff
  return logs.filter(log => new Date(log.timestamp) >= cutoffDate)
}

export function AuditLogs(): JSX.Element {
  const [activeTab, setActiveTab] = useState<AuditTabType>("grants")
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    action: "all",
    dateRange: "7days",
    userEmail: "all",
  })

  const {
    data: auditData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["auditLogs"],
    queryFn: () => api.audit.getRecentLogs(500),
    refetchInterval: 30000,
  })

  const getFilteredLogs = (): AuditLog[] => {
    if (!auditData?.logs) return []

    let filtered = filterByTab([...auditData.logs], activeTab)

    if (filters.action !== "all") {
      filtered = filtered.filter(log => log.action === filters.action)
    }

    filtered = filterByDateRange(filtered, filters.dateRange)

    if (filters.userEmail !== "all") {
      filtered = filtered.filter(log => log.user_email === filters.userEmail)
    }

    return filtered
  }

  const filteredLogs = getFilteredLogs()

  const allEmails = Array.from(
    new Set(
      auditData?.logs
        .filter(log => log.user_email !== null)
        .map(log => log.user_email as string) ?? [],
    ),
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
    if (tab === "applications" || tab === "security") {
      const hasData = auditData?.logs.some(log => {
        if (tab === "applications") return log.entity_type === "application"
        return SECURITY_ACTIONS.has(log.action) || !log.success
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
        {(
          [
            "all",
            "grants",
            "applications",
            "security",
            "admins",
          ] as AuditTabType[]
        ).map(tab => (
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
        ))}
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
        <div className="alert alert-info mb-4" role="alert">
          <strong>📋 Application Activity</strong>
          <p className="mb-0 mt-2">
            Showing all application lifecycle events including creation,
            submission, admin edits, and deletions.
          </p>
        </div>
      )}

      {activeTab === "security" && (
        <div className="alert alert-warning mb-4" role="alert">
          <strong>🔐 Security Events</strong>
          <p className="mb-0 mt-2">
            Showing security-relevant events: blocked edit attempts on submitted
            applications, failed login attempts, and unauthorized access
            attempts.
          </p>
        </div>
      )}

      {/* Filters */}
      {!isTabDisabled(activeTab) && (
        <AuditFilters onFilterChange={setFilters} adminEmails={allEmails} />
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

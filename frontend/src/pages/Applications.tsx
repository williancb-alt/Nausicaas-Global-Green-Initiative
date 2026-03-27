import { JSX, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useApplications } from "../hooks/useApplicationHooks"
import { ApplicationsListTable } from "../components/table/ApplicationsListTable"
import { ApplicationStatusFilterBar } from "../components/filter/ApplicationStatusFilterBar"
import {
  filterApplications,
  type AwardFilterValue,
  type StatusFilterValue,
} from "../utils/applications"

export function Applications(): JSX.Element {
  const navigate = useNavigate()
  const { data: applicationsData, isLoading, isError } = useApplications()
  const applications = applicationsData?.items ?? []
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all")
  const [awardFilter, setAwardFilter] = useState<AwardFilterValue>("all")

  const filteredApplications = useMemo(
    () =>
      filterApplications(applications, searchTerm, statusFilter, awardFilter),
    [applications, awardFilter, searchTerm, statusFilter],
  )
  const awardOptions = useMemo(
    () =>
      Array.from(
        new Set(
          applications
            .map(application => application.award?.name)
            .filter((awardName): awardName is string => Boolean(awardName)),
        ),
      ).sort((left, right) => left.localeCompare(right)),
    [applications],
  )

  if (isLoading) {
    return (
      <div className="container py-4">
        <h1 className="h4 mb-3">Applications</h1>
        <div className="alert alert-info">Loading applications...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container py-4">
        <h1 className="h4 mb-3">Applications</h1>
        <div className="alert alert-danger">Failed to load applications</div>
      </div>
    )
  }

  const handleViewApplication = (id: number) => {
    void navigate(`/admin/applications/${id}`)
  }

  const emptyStateMessage =
    applications.length === 0
      ? "No applications submitted yet."
      : "No applications match the selected filters."

  return (
    <div
      style={{ backgroundColor: "#f0fdf4", minHeight: "100vh" }}
      className="py-4"
    >
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1
            className="h3 mb-0"
            style={{ color: "#2f6f44", fontWeight: "700" }}
          >
            All Applications
          </h1>
          <span
            className="badge"
            style={{
              backgroundColor: "#3b7a57",
              color: "white",
              fontSize: "0.95rem",
            }}
          >
            {applications.length} total
          </span>
        </div>

        <div
          className="card border-0 shadow-sm mb-4"
          style={{ borderRadius: "16px" }}
        >
          <div className="card-body p-4">
            <h2 className="h5 mb-3 fw-bold" style={{ color: "#2d5a41" }}>
              Filter Applications
            </h2>
            <ApplicationStatusFilterBar
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              awardFilter={awardFilter}
              onAwardFilterChange={setAwardFilter}
              awardOptions={awardOptions}
            />
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div
            className="alert"
            style={{
              backgroundColor: "#eef7ee",
              color: "#2f6f44",
              border: "1px solid #3b7a57",
            }}
          >
            {emptyStateMessage}
          </div>
        ) : (
          <ApplicationsListTable
            applications={filteredApplications}
            onViewApplication={handleViewApplication}
          />
        )}
      </div>
    </div>
  )
}

export default Applications

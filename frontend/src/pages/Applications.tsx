import { JSX } from "react"
import { useNavigate } from "react-router-dom"
import { useApplications } from "../hooks/useApplicationHooks"
import { ApplicationsListTable } from "../components/table/ApplicationsListTable"

export function Applications(): JSX.Element {
  const navigate = useNavigate()
  const { data: applicationsData, isLoading, isError } = useApplications()
  const applications = applicationsData?.items ?? []

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

        {applications.length === 0 ? (
          <div
            className="alert"
            style={{
              backgroundColor: "#eef7ee",
              color: "#2f6f44",
              border: "1px solid #3b7a57",
            }}
          >
            No applications submitted yet.
          </div>
        ) : (
          <ApplicationsListTable
            applications={applications}
            onViewApplication={handleViewApplication}
          />
        )}
      </div>
    </div>
  )
}

export default Applications

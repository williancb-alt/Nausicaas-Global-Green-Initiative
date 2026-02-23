import { JSX } from "react"
import { useMyApplications } from "../hooks/useApplicationHooks"
import { useNavigate } from "react-router-dom"
import { ApplicationList } from "../components/application/ApplicationList"

export function MyApplications(): JSX.Element {
  const { data: applicationsData, isLoading, isError } = useMyApplications()
  const applications = applicationsData?.items ?? []
  const navigate = useNavigate()

  const handleViewDetails = (id: number) => {
    void navigate(`/applications/${id}`)
  }

  return (
    <div
      style={{ backgroundColor: "#eef7ee", minHeight: "100vh" }}
      className="py-4"
    >
      <div className="container">
        <h1 className="h3 mb-4" style={{ color: "#2f6f44", fontWeight: "700" }}>
          My Applications
        </h1>

        <ApplicationList
          isLoading={isLoading}
          isError={isError}
          applications={applications}
          onViewDetails={handleViewDetails}
        />
      </div>
    </div>
  )
}

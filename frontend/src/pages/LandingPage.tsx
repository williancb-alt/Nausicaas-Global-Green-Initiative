import { JSX } from "react"
import { useQuery } from "@tanstack/react-query"
import { useGrants } from "../hooks/useGrantHooks"
import { PublicGrantCard } from "../components/grant/PublicGrantCard"
import { applications } from "../services/api/applications"
import { useAuthStore } from "../store/authStore"

export function LandingPage(): JSX.Element {
  const { data: grantsData, isLoading, isError } = useGrants()
  const { isAuthenticated } = useAuthStore()

  // Fetch user's applications to show which grants they've applied to
  const { data: myApplicationsData } = useQuery({
    queryKey: ["myApplications"],
    queryFn: () => applications.getMyApplications(1, 100),
    enabled: isAuthenticated,
  })

  // Create a Map of grant names to application status
  const applicationStatusMap = new Map(
    myApplicationsData?.items.map(app => [app.grant.name, app.status]) || [],
  )

  const grants = grantsData?.items ?? []

  return (
    <div style={{ backgroundColor: "#eef7ee", minHeight: "100vh" }}>
      {/* Hero Section */}
      <section
        className="py-5"
        style={{
          backgroundColor: "#3b7a57",
          color: "white",
        }}
      >
        <div className="container text-center">
          <h1 className="display-4 fw-bold mb-4">
            Nausicaas Global Green Initiative
          </h1>
          <p
            className="lead mb-4"
            style={{ maxWidth: "800px", margin: "0 auto" }}
          >
            We are dedicated to supporting environmental projects and
            sustainable initiatives worldwide. Our grants program provides
            funding for individuals and organizations committed to making a
            positive impact on our planet.
          </p>
          <p className="mb-0" style={{ fontSize: "1.1rem" }}>
            Browse our available grants below and apply to receive funding for
            your green initiative.
          </p>
        </div>
      </section>

      {/* Grants Section */}
      <section className="py-5">
        <div className="container">
          <h2
            className="text-center mb-4"
            style={{ color: "#2f6f44", fontWeight: 600 }}
          >
            Available Grants
          </h2>

          {isLoading && (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading grants...</span>
              </div>
              <p className="mt-3 text-muted">Loading available grants...</p>
            </div>
          )}

          {isError && (
            <div className="alert alert-danger" role="alert">
              Unable to load grants. Please try again later.
            </div>
          )}

          {!isLoading && !isError && grants.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted fs-5">
                No grants are currently available. Please check back later.
              </p>
            </div>
          )}

          {!isLoading && !isError && grants.length > 0 && (
            <div className="row">
              {grants.map(grant => (
                <div key={grant.name} className="col-lg-6 mb-4">
                  <PublicGrantCard
                    grant={grant}
                    applicationStatus={applicationStatusMap.get(grant.name)}
                  />
                </div>
              ))}
            </div>
          )}

          {grantsData && grantsData.total_pages > 1 && (
            <div className="text-center mt-4">
              <p className="text-muted">
                Showing page {grantsData.page} of {grantsData.total_pages} (
                {grantsData.total_items} total grants)
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

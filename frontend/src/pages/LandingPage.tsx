import { JSX } from "react"
import { useQuery } from "@tanstack/react-query"
import { useGrants } from "../hooks/useGrantHooks"
import { applications } from "../services/api/applications"
import { useAuthStore } from "../store/authStore"
import { GrantsList } from "../components/grant/GrantList"
import { ApplicationStatus } from "../types"

export type ApplicationStatusMap = Map<string, ApplicationStatus>

export function LandingPage(): JSX.Element {
  const { data: grantsData, isLoading, isError } = useGrants()
  const { isAuthenticated } = useAuthStore()

  const { data: myApplicationsData } = useQuery({
    queryKey: ["myApplications"],
    queryFn: () => applications.getMyApplications(1, 100),
    enabled: isAuthenticated,
  })

  const applicationStatusMap: ApplicationStatusMap = new Map(
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

          <GrantsList
            isLoading={isLoading}
            isError={isError}
            grants={grants}
            grantsData={grantsData}
            applicationStatusMap={applicationStatusMap}
          />
        </div>
      </section>
    </div>
  )
}

import { JSX } from "react"
import { useGrants } from "../../hooks/useGrantHooks"
import { Grant } from "../../services/api"
import { PublicGrantCard } from "./PublicGrantCard"
import { ApplicationStatusMap } from "../../pages/LandingPage"

interface GrantsListProps {
  isLoading: boolean
  isError: boolean
  grants: Grant[]
  grantsData: ReturnType<typeof useGrants>["data"]
  applicationStatusMap: ApplicationStatusMap
}

export function GrantsList({
  isLoading,
  isError,
  grants,
  grantsData,
  applicationStatusMap,
}: GrantsListProps): JSX.Element {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading grants...</span>
        </div>
        <p className="mt-3 text-muted">Loading available grants...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="alert alert-danger" role="alert">
        Unable to load grants. Please try again later.
      </div>
    )
  }

  if (grants.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted fs-5">
          No grants are currently available. Please check back later.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="row justify-content-center">
        {grants.map(grant => (
          <div key={grant.name} className="col-12 mb-4">
            <PublicGrantCard
              grant={grant}
              applicationStatus={applicationStatusMap.get(grant.name)}
            />
          </div>
        ))}
      </div>

      {grantsData && grantsData.total_pages > 1 && (
        <div className="text-center mt-4">
          <p className="text-muted">
            Showing page {grantsData.page} of {grantsData.total_pages} (
            {grantsData.total_items} total grants)
          </p>
        </div>
      )}
    </>
  )
}

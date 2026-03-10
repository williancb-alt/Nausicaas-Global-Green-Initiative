import { JSX } from "react"
import { useAwards } from "../../hooks/useAwardHooks"
import { Award } from "../../services/api"
import { PublicAwardCard } from "./PublicAwardCard"

interface AwardsListProps {
  isLoading: boolean
  isError: boolean
  awards: Award[]
  awardsData: ReturnType<typeof useAwards>["data"]
}

export function AwardsList({
  isLoading,
  isError,
  awards,
  awardsData,
}: AwardsListProps): JSX.Element {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading awards...</span>
        </div>
        <p className="mt-3 text-muted">Loading available awards...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="alert alert-danger" role="alert">
        Unable to load awards. Please try again later.
      </div>
    )
  }

  if (awards.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted fs-5">
          No awards are currently available. Please check back later.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="row justify-content-center">
        {awards.map(award => (
          <div key={award.name} className="col-12 mb-4">
            <PublicAwardCard award={award} />
          </div>
        ))}
      </div>

      {awardsData && awardsData.total_pages > 1 && (
        <div className="text-center mt-4">
          <p className="text-muted">
            Showing page {awardsData.page} of {awardsData.total_pages} (
            {awardsData.total_items} total awards)
          </p>
        </div>
      )}
    </>
  )
}

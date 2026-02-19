import { JSX } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useApplication } from "../hooks/useApplicationHooks"
import { UserApplicationLoadingView } from "../components/application/UserApplicationLoadingView"
import { UserApplicationNotFoundView } from "../components/application/UserApplicationNotFoundView"
import { UserApplicationDetails } from "../components/application/UserApplicationDetails"

export function UserApplicationView(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: application, isLoading } = useApplication(id)

  const handleBackToApplications = () => {
    void navigate("/dashboard")
  }

  if (isLoading) {
    return <UserApplicationLoadingView />
  }

  if (!application) {
    return <UserApplicationNotFoundView onBack={handleBackToApplications} />
  }

  return (
    <UserApplicationDetails
      application={application}
      onBack={handleBackToApplications}
    />
  )
}

export default UserApplicationView

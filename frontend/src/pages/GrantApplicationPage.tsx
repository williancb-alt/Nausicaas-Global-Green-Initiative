import { type FormEvent, JSX, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { useGrant } from "../hooks/useGrantHooks"
import { useSubmitApplication } from "../hooks/useApplicationHooks"
import { GrantApplicationLoadingView } from "../components/grant/GrantApplicationLoadingView"
import { GrantApplicationErrorView } from "../components/grant/GrantApplicationErrorView"
import { GrantApplicationSuccessView } from "../components/grant/GrantApplicationSuccessView"
import { GrantApplicationForm } from "../components/grant/GrantApplicationForm"

export function GrantApplicationPage(): JSX.Element {
  const { grantName } = useParams<{ grantName: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: grant, isLoading, isError } = useGrant(grantName ?? "")
  const submitApplication = useSubmitApplication()

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleFieldChange = (fieldKey: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [fieldKey]: value }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    submitApplication.mutate(
      { grantName: grantName ?? "", fieldValues },
      {
        onSuccess: () => {
          setSubmitSuccess(true)
        },
        onError: error => {
          setSubmitError(
            error instanceof Error
              ? error.message
              : "Failed to submit application",
          )
        },
      },
    )
  }

  const handleReturnHome = () => {
    void navigate("/")
  }

  if (isLoading) {
    return <GrantApplicationLoadingView />
  }

  if (isError || !grant) {
    return <GrantApplicationErrorView onReturnHome={handleReturnHome} />
  }

  if (submitSuccess) {
    return (
      <GrantApplicationSuccessView
        grantName={grant.name}
        userEmail={user?.email ?? ""}
        onReturnHome={handleReturnHome}
      />
    )
  }

  return (
    <GrantApplicationForm
      grant={grant}
      fieldValues={fieldValues}
      onFieldChange={handleFieldChange}
      onSubmit={handleSubmit}
      submitError={submitError}
      isSubmitting={submitApplication.isPending}
      onCancel={handleReturnHome}
    />
  )
}

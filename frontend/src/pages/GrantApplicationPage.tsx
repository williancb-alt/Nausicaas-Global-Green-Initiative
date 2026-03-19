import { type FormEvent, JSX, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { useGrant } from "../hooks/useGrantHooks"
import { useSubmitApplication } from "../hooks/useApplicationHooks"
import { api } from "../services/api"
import { GrantApplicationLoadingView } from "../components/grant/GrantApplicationLoadingView"
import { GrantApplicationErrorView } from "../components/grant/GrantApplicationErrorView"
import { GrantApplicationSuccessView } from "../components/grant/GrantApplicationSuccessView"
import { GrantApplicationForm } from "../components/grant/GrantApplicationForm"

export function GrantApplicationPage(): JSX.Element {
  const { grantName } = useParams<{ grantName: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: grant, isLoading, isError } = useGrant(grantName ?? "")
  const {
    data: awardsData,
    isLoading: isAwardsLoading,
    error: awardsError,
  } = useQuery({
    queryKey: ["application-awards"],
    queryFn: () => api.awards.listAwards(1, 100),
  })
  const submitApplication = useSubmitApplication()

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [selectedAwardName, setSelectedAwardName] = useState("")
  const [awardJustification, setAwardJustification] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleFieldChange = (fieldKey: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [fieldKey]: value }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    const applicationPayload: {
      grantName: string
      fieldValues: Record<string, string>
      awardName?: string
      awardJustification?: string
    } = {
      grantName: grantName ?? "",
      fieldValues,
    }
    if (selectedAwardName) {
      applicationPayload.awardName = selectedAwardName
      applicationPayload.awardJustification = awardJustification
    }

    submitApplication.mutate(applicationPayload, {
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
    })
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

  const awards = awardsData?.items ?? []

  return (
    <GrantApplicationForm
      grant={grant}
      awards={awards}
      isAwardsLoading={isAwardsLoading}
      awardsError={awardsError instanceof Error ? awardsError.message : null}
      fieldValues={fieldValues}
      selectedAwardName={selectedAwardName}
      awardJustification={awardJustification}
      onFieldChange={handleFieldChange}
      onAwardChange={awardName => {
        setSelectedAwardName(awardName)
        if (!awardName) {
          setAwardJustification("")
        }
      }}
      onAwardJustificationChange={setAwardJustification}
      onSubmit={handleSubmit}
      submitError={submitError}
      isSubmitting={submitApplication.isPending}
      onCancel={handleReturnHome}
    />
  )
}

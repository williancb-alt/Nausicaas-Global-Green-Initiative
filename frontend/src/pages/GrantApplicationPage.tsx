import { JSX, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "../components/button/Button"
import { DynamicFieldInput } from "../components/dynamicFields/DynamicFieldInput"
import { useAuthStore } from "../store/authStore"
import { useGrant } from "../hooks/useGrantHooks"
import { useSubmitApplication } from "../hooks/useApplicationHooks"

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    submitApplication.mutate(
      { grantName: grantName ?? "", fieldValues },
      {
        onSuccess: () => {
          setSubmitSuccess(true)
        },
        onError: (error) => {
          setSubmitError(
            error instanceof Error ? error.message : "Failed to submit application"
          )
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div
        className="container py-5 text-center"
        style={{ minHeight: "100vh", backgroundColor: "#eef7ee" }}
      >
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading grant details...</span>
        </div>
        <p className="mt-3 text-muted">Loading grant details...</p>
      </div>
    )
  }

  if (isError || !grant) {
    return (
      <div
        className="container py-5"
        style={{ minHeight: "100vh", backgroundColor: "#eef7ee" }}
      >
        <div className="alert alert-danger" role="alert">
          Unable to load grant details. The grant may not exist.
        </div>
        <Button variant="secondary" onClick={() => navigate("/")}>
          Return to Home
        </Button>
      </div>
    )
  }

  if (submitSuccess) {
    return (
      <div
        className="container py-5"
        style={{ minHeight: "100vh", backgroundColor: "#eef7ee" }}
      >
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div
              className="card"
              style={{ border: "2px solid #3b7a57", borderRadius: "8px" }}
            >
              <div
                className="card-header text-center"
                style={{ backgroundColor: "#3b7a57", color: "white" }}
              >
                <h4 className="mb-0">Application Submitted</h4>
              </div>
              <div className="card-body text-center py-5">
                <div
                  className="mb-4"
                  style={{ fontSize: "4rem", color: "#3b7a57" }}
                >
                  &#10003;
                </div>
                <h5 className="mb-3">Thank you for your application!</h5>
                <p className="text-muted mb-4">
                  Your application for <strong>{grant.name}</strong> has been
                  submitted successfully. We will review your application and
                  contact you at {user?.email}.
                </p>
                <Button variant="success" onClick={() => navigate("/")}>
                  Return to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const customFields = grant.custom_fields?.configs ?? []
  const hasFields = customFields.length > 0

  return (
    <div style={{ backgroundColor: "#eef7ee", minHeight: "100vh" }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div
              className="card"
              style={{ border: "2px solid #3b7a57", borderRadius: "8px" }}
            >
              <div
                className="card-header"
                style={{ backgroundColor: "#3b7a57", color: "white" }}
              >
                <h4 className="mb-0">Apply for: {grant.name}</h4>
              </div>

              <div className="card-body p-4">
                {/* Grant Details */}
                <div className="mb-4">
                  <h5 style={{ color: "#2f6f44" }}>{grant.name}</h5>

                  <div className="d-flex gap-3 mb-3">
                    <span className="badge bg-success fs-6">
                      Deadline: {grant.deadline}
                    </span>
                    {grant.time_remaining && (
                      <span className="badge bg-warning text-dark fs-6">
                        {grant.time_remaining} remaining
                      </span>
                    )}
                  </div>

                  {grant.description && (
                    <div
                      className="p-3 rounded mb-3"
                      style={{ backgroundColor: "#f0f7f0" }}
                    >
                      <strong>Description:</strong>
                      <p className="mb-0 mt-2">{grant.description}</p>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit}>
                  {hasFields && (
                    <>
                      <h5
                        className="mb-3 pb-2 border-bottom"
                        style={{ color: "#2f6f44" }}
                      >
                        Application Form
                      </h5>

                      {customFields.map((field, index) => (
                        <DynamicFieldInput
                          key={index}
                          field={field}
                          index={index}
                          value={fieldValues[`field_${index}`] ?? ""}
                          onChange={value =>
                            handleFieldChange(`field_${index}`, value)
                          }
                        />
                      ))}
                    </>
                  )}

                  {submitError && (
                    <div className="alert alert-danger" role="alert">
                      {submitError}
                    </div>
                  )}

                  <div className="d-flex gap-3 mt-4">
                    <Button
                      type="submit"
                      variant="success"
                      disabled={submitApplication.isPending}
                      className="px-4"
                    >
                      {submitApplication.isPending ? "Submitting..." : "Submit Application"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigate("/")}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

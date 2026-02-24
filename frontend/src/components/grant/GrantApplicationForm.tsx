import { type FormEvent, type JSX, useState, useCallback } from "react"
import { DynamicFieldInput } from "../dynamicFields/DynamicFieldInput"
import { Button } from "../button/Button"
import { Grant } from "../../services/api"

interface GrantApplicationFormProps {
  grant: Grant
  fieldValues: Record<string, string>
  onFieldChange: (fieldKey: string, value: string) => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  submitError: string | null
  isSubmitting: boolean
  onCancel: () => void
}

export function GrantApplicationForm({
  grant,
  fieldValues,
  onFieldChange,
  onSubmit,
  submitError,
  isSubmitting,
  onCancel,
}: GrantApplicationFormProps): JSX.Element {
  const customFields = grant.custom_fields?.configs ?? []
  const hasFields = customFields.length > 0
  const [requiredError, setRequiredError] = useState<string | null>(null)

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      const missingFields: string[] = []
      customFields.forEach((field, index) => {
        if (field.required) {
          const val = fieldValues[`field_${index}`] ?? ""
          if (!val.trim()) {
            missingFields.push(field.label)
          }
        }
      })

      if (missingFields.length > 0) {
        setRequiredError(
          `Please fill in the following required fields: ${missingFields.join(", ")}`,
        )
        return
      }

      setRequiredError(null)
      onSubmit(e)
    },
    [customFields, fieldValues, onSubmit],
  )

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
                            onFieldChange(`field_${index}`, value)
                          }
                        />
                      ))}
                    </>
                  )}

                  {requiredError && (
                    <div className="alert alert-danger" role="alert">
                      {requiredError}
                    </div>
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
                      disabled={isSubmitting}
                      className="px-4"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={onCancel}
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

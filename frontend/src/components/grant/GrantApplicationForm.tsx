import { type FormEvent, type JSX, useState, useCallback, useMemo } from "react"
import { DynamicFieldInput } from "../dynamicFields/DynamicFieldInput"
import { Button } from "../button/Button"
import { Award, Grant } from "../../services/api"
import type { DynamicFieldConfig } from "../../types"

function GrantInfoHeader({ grant }: { grant: Grant }): JSX.Element {
  return (
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
  )
}

function ApplicationFields({
  fields,
  fieldValues,
  onFieldChange,
}: {
  fields: DynamicFieldConfig[]
  fieldValues: Record<string, string>
  onFieldChange: (fieldKey: string, value: string) => void
}): JSX.Element | null {
  if (fields.length === 0) return null
  return (
    <>
      <h5 className="mb-3 pb-2 border-bottom" style={{ color: "#2f6f44" }}>
        Application Form
      </h5>

      {fields.map((field, index) => (
        <DynamicFieldInput
          key={index}
          field={field}
          index={index}
          value={fieldValues[`field_${index}`] ?? ""}
          onChange={value => onFieldChange(`field_${index}`, value)}
        />
      ))}
    </>
  )
}

function validateApplicationSubmission(
  customFields: DynamicFieldConfig[],
  fieldValues: Record<string, string>,
  selectedAwardName: string,
  awardJustification: string,
): string | null {
  const missingFields = customFields
    .filter(
      (field, index) =>
        field.required && !(fieldValues[`field_${index}`] ?? "").trim(),
    )
    .map(field => field.label)

  if (missingFields.length > 0) {
    return `Please fill in the following required fields: ${missingFields.join(", ")}`
  }

  if (selectedAwardName && !awardJustification.trim()) {
    return "Please explain why your application should be considered for the selected award."
  }

  return null
}

function AwardConsiderationSection({
  awards,
  isAwardsLoading,
  awardsError,
  selectedAwardName,
  awardJustification,
  onAwardChange,
  onAwardJustificationChange,
}: {
  awards: Award[]
  isAwardsLoading: boolean
  awardsError: string | null
  selectedAwardName: string
  awardJustification: string
  onAwardChange: (awardName: string) => void
  onAwardJustificationChange: (value: string) => void
}): JSX.Element {
  return (
    <div className="mt-4">
      <h5 className="mb-3 pb-2 border-bottom" style={{ color: "#2f6f44" }}>
        Award Consideration
      </h5>

      <label className="form-label" htmlFor="award-selection">
        Select an award to be considered for
      </label>
      <select
        id="award-selection"
        className="form-select"
        value={selectedAwardName}
        onChange={e => onAwardChange(e.target.value)}
        disabled={isAwardsLoading}
      >
        <option value="">No award selection</option>
        {awards.map(award => (
          <option key={award.name} value={award.name}>
            {award.name}
          </option>
        ))}
      </select>
      <div className="form-text">
        This is optional. If you select an award, include a short justification
        below.
      </div>

      {awardsError && (
        <div className="alert alert-warning mt-3 mb-0" role="alert">
          {awardsError}
        </div>
      )}

      {selectedAwardName && (
        <div className="mt-3">
          <label className="form-label" htmlFor="award-justification">
            Why should your application be considered for this award?
          </label>
          <textarea
            id="award-justification"
            className="form-control"
            rows={4}
            value={awardJustification}
            onChange={e => onAwardJustificationChange(e.target.value)}
            placeholder="Describe how your application aligns with this award."
          />
        </div>
      )}
    </div>
  )
}

interface GrantApplicationFormProps {
  grant: Grant
  awards: Award[]
  isAwardsLoading: boolean
  awardsError: string | null
  fieldValues: Record<string, string>
  selectedAwardName: string
  awardJustification: string
  onFieldChange: (fieldKey: string, value: string) => void
  onAwardChange: (awardName: string) => void
  onAwardJustificationChange: (value: string) => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  submitError: string | null
  isSubmitting: boolean
  onCancel: () => void
}

export function GrantApplicationForm({
  grant,
  awards,
  isAwardsLoading,
  awardsError,
  fieldValues,
  selectedAwardName,
  awardJustification,
  onFieldChange,
  onAwardChange,
  onAwardJustificationChange,
  onSubmit,
  submitError,
  isSubmitting,
  onCancel,
}: GrantApplicationFormProps): JSX.Element {
  const customFields = useMemo(
    () => grant.custom_fields?.configs ?? [],
    [grant.custom_fields?.configs],
  )
  const [requiredError, setRequiredError] = useState<string | null>(null)

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      const validationError = validateApplicationSubmission(
        customFields,
        fieldValues,
        selectedAwardName,
        awardJustification,
      )
      if (validationError) {
        setRequiredError(validationError)
        return
      }

      setRequiredError(null)
      onSubmit(e)
    },
    [
      awardJustification,
      customFields,
      fieldValues,
      onSubmit,
      selectedAwardName,
    ],
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
                <GrantInfoHeader grant={grant} />

                <form onSubmit={handleSubmit}>
                  <ApplicationFields
                    fields={customFields}
                    fieldValues={fieldValues}
                    onFieldChange={onFieldChange}
                  />

                  <AwardConsiderationSection
                    awards={awards}
                    isAwardsLoading={isAwardsLoading}
                    awardsError={awardsError}
                    selectedAwardName={selectedAwardName}
                    awardJustification={awardJustification}
                    onAwardChange={onAwardChange}
                    onAwardJustificationChange={onAwardJustificationChange}
                  />

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

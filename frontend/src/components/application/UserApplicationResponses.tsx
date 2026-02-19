import { JSX } from "react"

interface UserApplicationResponsesProps {
  fieldValues: Record<string, string> | null | undefined
  customFieldConfigs?: { label: string }[] | null
}

export function UserApplicationResponses({
  fieldValues,
  customFieldConfigs,
}: UserApplicationResponsesProps): JSX.Element | null {
  if (!fieldValues || Object.keys(fieldValues).length === 0) {
    return (
      <div
        className="text-center py-4 text-muted border rounded"
        style={{ borderStyle: "dashed" }}
      >
        No custom field responses were submitted for this application.
      </div>
    )
  }

  return (
    <div className="row g-3">
      {Object.entries(fieldValues).map(([key, value]) => {
        const indexMatch = key.match(/^field_(\d+)$/)
        let label = key

        if (indexMatch && customFieldConfigs) {
          const fieldIndex = parseInt(indexMatch[1], 10)
          const fieldConfig = customFieldConfigs[fieldIndex]
          if (fieldConfig) {
            label = fieldConfig.label
          }
        }

        return (
          <div key={key} className="col-12">
            <div
              className="p-3 rounded-3"
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <label
                className="text-muted small text-uppercase fw-bold mb-1 d-block"
                style={{ letterSpacing: "0.05em" }}
              >
                {label}
              </label>
              <div
                className="fw-medium text-dark"
                style={{ fontSize: "1.1rem" }}
              >
                {value || (
                  <span className="text-muted italic">Not provided</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

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
    return null
  }

  return (
    <div className="mb-3">
      <strong>Your Responses:</strong>
      <div className="mt-2 p-3 bg-light rounded">
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
            <div key={key} className="mb-2">
              <strong style={{ color: "#2f6f44" }}>{label}:</strong> {value}
            </div>
          )
        })}
      </div>
    </div>
  )
}

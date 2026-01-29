import { JSX } from "react"
import type { DynamicFieldConfig } from "../../types"

interface DynamicFieldPreviewProps {
  fields: DynamicFieldConfig[]
}

const typeLabels: Record<string, string> = {
  text: "Text",
  radio: "Radio",
  phone: "Phone",
  email: "Email",
}

export function DynamicFieldPreview({
  fields,
}: DynamicFieldPreviewProps): JSX.Element | null {
  if (fields.length === 0) return null

  return (
    <div className="mb-3">
      <label className="form-label">Custom Fields ({fields.length})</label>
      <div className="list-group">
        {fields.map((field, index) => (
          <div key={index} className="list-group-item list-group-item-light">
            <div className="d-flex justify-content-between">
              <span className="fw-semibold">{field.label}</span>
              <span className="badge bg-secondary">
                {typeLabels[field.type] || field.type}
              </span>
            </div>
            {field.type === "text" && (
              <small className="text-muted">
                Max {field.maxLength} characters
              </small>
            )}
            {field.type === "radio" && (
              <small className="text-muted">
                Options: {field.options.join(", ")}
              </small>
            )}
            {field.type === "phone" && (
              <small className="text-muted">Validated phone number</small>
            )}
            {field.type === "email" && (
              <small className="text-muted">Validated email address</small>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

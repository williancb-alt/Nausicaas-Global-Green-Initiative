import { JSX } from "react"
import { Lock } from "lucide-react"
import type { DynamicFieldConfig } from "../../types"
import { DynamicFieldInput } from "../dynamicFields/DynamicFieldInput"

interface UserApplicationResponsesProps {
  fieldValues: Record<string, string> | null | undefined
  customFieldConfigs?: DynamicFieldConfig[] | null
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
    <>
      <div
        className="d-flex align-items-center gap-2 mb-3"
        style={{
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "0.75rem",
        }}
      >
        <Lock size={14} color="#6b7280" />
        <span
          className="text-uppercase fw-bold"
          style={{
            color: "#6b7280",
            fontSize: "0.72rem",
            letterSpacing: "0.06em",
          }}
        >
          Read-only responses
        </span>
      </div>

      {customFieldConfigs
        ? customFieldConfigs.map((config, i) => {
            const key = `field_${i}`
            return (
              <DynamicFieldInput
                key={key}
                field={config}
                index={i}
                value={fieldValues[key] ?? ""}
                onChange={() => {}}
                disabled={true}
              />
            )
          })
        : Object.entries(fieldValues).map(([key, value]) => (
            <div key={key} className="mb-3">
              <label
                className="form-label text-muted small text-uppercase fw-bold"
                style={{ letterSpacing: "0.05em" }}
              >
                {key}
              </label>
              <input
                type="text"
                className="form-control"
                value={value}
                onChange={() => {}}
                disabled
              />
            </div>
          ))}
    </>
  )
}

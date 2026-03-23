import { JSX } from "react"
import { DynamicFieldPreview } from "../../dynamicFields/DynamicFieldPreview"
import { DynamicFieldInput } from "../../dynamicFields/DynamicFieldInput"
import type { DynamicFieldConfig } from "../../../types"
import { GRANT_MANAGEMENT_STYLES } from "../../../utils/constants"

export function CustomFieldManagement({
  configs,
  values,
  onSetValue,
  onRemove,
  onOpenModal,
}: {
  configs: DynamicFieldConfig[]
  values: Record<string, string>
  onSetValue: (label: string, value: string) => void
  onRemove: (idx: number) => void
  onOpenModal: () => void
}): JSX.Element {
  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label
          className="form-label mb-0"
          style={{ color: "#2f6f44", fontWeight: 600 }}
        >
          Custom Fields
        </label>
        <button
          type="button"
          className="btn btn-sm"
          style={GRANT_MANAGEMENT_STYLES.btnPrimary}
          onClick={onOpenModal}
        >
          Add Field
        </button>
      </div>

      <DynamicFieldPreview fields={configs} />
      {configs.map((f, idx) => (
        <div key={idx} className="d-flex align-items-start gap-2 mb-2">
          <div className="flex-grow-1">
            <DynamicFieldInput
              field={f}
              index={idx}
              value={values[f.label] || ""}
              onChange={v => onSetValue(f.label, v)}
            />
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => onRemove(idx)}
          >
            -
          </button>
        </div>
      ))}
    </div>
  )
}

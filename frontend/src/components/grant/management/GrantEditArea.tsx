import { JSX } from "react"
import { DynamicFieldPreview } from "../../dynamicFields/DynamicFieldPreview"
import { DynamicFieldInput } from "../../dynamicFields/DynamicFieldInput"
import {
  GRANT_FORM_FIELDS,
  GRANT_MANAGEMENT_STYLES,
} from "../../../utils/constants"
import { GrantEditAreaProps } from "./types"

/**
 * Component for the Grant Editing Area.
 */
export function GrantEditArea({
  editingId,
  editFormData,
  handleEditChange,
  isPending,
  onSave,
  onCancel,
  customFieldConfigs,
  customFieldValues,
  setFieldValue,
  handleRemoveField,
  setIsFieldModalOpen,
}: GrantEditAreaProps): JSX.Element {
  return (
    <div
      className="card mt-4"
      style={{ borderColor: "#3b7a57", borderWidth: "2px" }}
    >
      <div
        className="card-header"
        style={{ backgroundColor: "#3b7a57", color: "white" }}
      >
        <h5 className="card-title mb-0">Edit Grant: {editingId}</h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-4">
            <label
              className="form-label"
              style={{ color: "#2f6f44", fontWeight: "500" }}
            >
              Name
            </label>
            <input
              type="text"
              className="form-control"
              value={editFormData.name}
              disabled
              style={{ backgroundColor: "#eef7ee" }}
            />
            <small className="text-muted">Name cannot be changed</small>
          </div>
          <div className="col-md-4">
            <label
              className="form-label"
              style={{ color: "#2f6f44", fontWeight: "500" }}
            >
              Deadline
            </label>
            <input
              type="text"
              className="form-control"
              value={editFormData.deadline}
              onChange={e =>
                handleEditChange(GRANT_FORM_FIELDS.DEADLINE, e.target.value)
              }
              placeholder="MM/DD/YY"
              style={GRANT_MANAGEMENT_STYLES.input}
            />
          </div>
          <div className="col-md-12">
            <label
              className="form-label"
              style={{ color: "#2f6f44", fontWeight: "500" }}
            >
              Description
            </label>
            <textarea
              className="form-control"
              value={editFormData.description}
              onChange={e =>
                handleEditChange(GRANT_FORM_FIELDS.DESCRIPTION, e.target.value)
              }
              placeholder="Grant description"
              rows={3}
              style={GRANT_MANAGEMENT_STYLES.input}
            />
          </div>
        </div>

        <div className="mt-3">
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
              style={{ backgroundColor: "#3b7a57", color: "white" }}
              onClick={() => setIsFieldModalOpen(true)}
            >
              Add Field
            </button>
          </div>

          <DynamicFieldPreview fields={customFieldConfigs} />
          {customFieldConfigs.map((f, idx) => (
            <div key={idx} className="d-flex align-items-start gap-2 mb-2">
              <div className="flex-grow-1">
                <DynamicFieldInput
                  field={f}
                  index={idx}
                  value={customFieldValues[f.label] || ""}
                  onChange={v => setFieldValue(f.label, v)}
                />
              </div>
              <div>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => handleRemoveField(idx)}
                >
                  -
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="d-flex gap-2 mt-3">
          <button
            className="btn"
            style={{ backgroundColor: "#3b7a57", color: "white" }}
            onClick={onSave}
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

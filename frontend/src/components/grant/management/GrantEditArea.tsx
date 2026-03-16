import { JSX } from "react"
import {
  GRANT_FORM_FIELDS,
  GRANT_MANAGEMENT_STYLES,
} from "../../../utils/constants"
import { GrantEditAreaProps } from "./types"
import { CustomFieldManagement } from "./CustomFieldManagement"

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

        <CustomFieldManagement
          configs={customFieldConfigs}
          values={customFieldValues}
          onSetValue={setFieldValue}
          onRemove={handleRemoveField}
          onOpenModal={() => setIsFieldModalOpen(true)}
        />

        <div className="d-flex gap-2 mt-4 pt-3 border-top">
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

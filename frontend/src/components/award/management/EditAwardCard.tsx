import { JSX } from "react"
import { AWARD_MANAGEMENT_STYLES } from "../../../utils/constants"
import { EditAwardCardProps } from "./types"

export function EditAwardCard({
  editingId,
  editFormData,
  isSaving,
  onChange,
  onSave,
  onCancel,
}: EditAwardCardProps): JSX.Element {
  return (
    <div
      className="card mt-4"
      style={{ borderColor: "#3b7a57", borderWidth: "2px" }}
    >
      <div
        className="card-header"
        style={{ backgroundColor: "#3b7a57", color: "white" }}
      >
        <h5 className="card-title mb-0">Edit Award: {editingId}</h5>
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
              onChange={e => onChange("deadline", e.target.value)}
              placeholder="MM/DD/YY"
              style={AWARD_MANAGEMENT_STYLES.input}
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
              onChange={e => onChange("description", e.target.value)}
              placeholder="Award description"
              rows={3}
              style={AWARD_MANAGEMENT_STYLES.input}
            />
          </div>
        </div>

        <div className="d-flex gap-2 mt-3">
          <button
            className="btn"
            style={{ backgroundColor: "#3b7a57", color: "white" }}
            onClick={onSave}
            disabled={isSaving}
            type="button"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSaving}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

import { JSX } from "react"
import {
  GRANT_FORM_FIELDS,
  GRANT_MANAGEMENT_STYLES,
} from "../../../utils/constants"
import { GrantEditField } from "./types"

interface EditGrantFieldsProps {
  editFormData: { name: string; deadline: string; description: string }
  handleEditChange: (field: GrantEditField, value: string) => void
}

export function EditGrantFields({
  editFormData,
  handleEditChange,
}: EditGrantFieldsProps): JSX.Element {
  return (
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
  )
}

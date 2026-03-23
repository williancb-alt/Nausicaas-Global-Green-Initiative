import { JSX } from "react"
import { GrantEditAreaProps } from "./types"
import { CustomFieldManagement } from "./CustomFieldManagement"
import { EditGrantFields } from "./EditGrantFields"

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
        <EditGrantFields
          editFormData={editFormData}
          handleEditChange={handleEditChange}
        />

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

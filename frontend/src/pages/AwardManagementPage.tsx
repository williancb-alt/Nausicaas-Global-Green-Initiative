import { JSX } from "react"
import { Plus } from "lucide-react"
import {
  AWARD_FORM_FIELDS,
  AWARD_MANAGEMENT_STYLES,
  AWARD_MESSAGES,
} from "../utils/constants"

// Management sub-components
import { AwardsTable } from "../components/award/management/AwardsTable"
import { EditAwardCard } from "../components/award/management/EditAwardCard"

// Hooks
import { useAwardManagement } from "../hooks/useAwardManagement"

function AlertMessage({ message }: { message: string }): JSX.Element {
  return (
    <div
      className="alert"
      style={{
        backgroundColor: "#eef7ee",
        color: "#2f6f44",
        border: "1px solid #3b7a57",
      }}
    >
      {message}
    </div>
  )
}

export function AwardManagementPage(): JSX.Element {
  const {
    awards,
    isLoading,
    register,
    handleSubmit,
    onCreate,
    isCreating,
    errors,
    editingId,
    setEditingId,
    editFormData,
    startEdit,
    handleEditChange,
    saveEdit,
    isSaving,
    onDelete,
    toggleVisibility,
    togglingAward,
  } = useAwardManagement()

  const renderAwardsContent = () => {
    if (isLoading) {
      return <AlertMessage message={AWARD_MESSAGES.loadingAwards} />
    }

    if (awards.length === 0) {
      return <AlertMessage message={AWARD_MESSAGES.noAwards} />
    }

    return (
      <AwardsTable
        awards={awards}
        togglingAward={togglingAward}
        onEdit={startEdit}
        onToggleVisibility={toggleVisibility}
        onDelete={onDelete}
      />
    )
  }

  return (
    <div style={AWARD_MANAGEMENT_STYLES.pageBg} className="py-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0" style={AWARD_MANAGEMENT_STYLES.header}>
            Award Management
          </h1>
          <span className="badge" style={AWARD_MANAGEMENT_STYLES.badge}>
            {awards.length} awards
          </span>
        </div>

        <div className="card mb-4" style={AWARD_MANAGEMENT_STYLES.card}>
          <div
            className="card-header"
            style={AWARD_MANAGEMENT_STYLES.cardHeader}
          >
            <h5
              className="card-title mb-0 d-flex align-items-center gap-2"
              style={{ color: "#2f6f44" }}
            >
              <Plus size={18} /> Create New Award
            </h5>
          </div>
          <div className="card-body">
            <form onSubmit={e => void handleSubmit(onCreate)(e)}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label
                    className="form-label"
                    style={{ color: "#2f6f44", fontWeight: "500" }}
                  >
                    Award Name
                  </label>
                  <input
                    {...register(AWARD_FORM_FIELDS.NAME)}
                    placeholder="Award name"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    style={AWARD_MANAGEMENT_STYLES.input}
                  />
                  {errors.name && (
                    <div className="invalid-feedback d-block">
                      {errors.name.message}
                    </div>
                  )}
                </div>

                <div className="col-md-3">
                  <label
                    className="form-label"
                    style={{ color: "#2f6f44", fontWeight: "500" }}
                  >
                    Deadline
                  </label>
                  <input
                    {...register(AWARD_FORM_FIELDS.DEADLINE)}
                    placeholder="MM/DD/YY"
                    className={`form-control ${errors.deadline ? "is-invalid" : ""}`}
                    style={AWARD_MANAGEMENT_STYLES.input}
                  />
                  {errors.deadline && (
                    <div className="invalid-feedback d-block">
                      {errors.deadline.message}
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <div className="d-flex justify-content-between align-items-center">
                    <label
                      className="form-label"
                      style={{ color: "#2f6f44", fontWeight: "500" }}
                    >
                      Description
                    </label>
                    <button
                      type="submit"
                      className="btn btn-sm"
                      style={{ backgroundColor: "#3b7a57", color: "white" }}
                      disabled={isCreating}
                    >
                      {isCreating ? "Creating..." : "Create Award"}
                    </button>
                  </div>
                  <textarea
                    {...register(AWARD_FORM_FIELDS.DESCRIPTION)}
                    placeholder="Award description"
                    className={`form-control ${errors.description ? "is-invalid" : ""}`}
                    rows={1}
                    style={AWARD_MANAGEMENT_STYLES.input}
                  />
                  {errors.description && (
                    <div className="invalid-feedback d-block">
                      {errors.description.message}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        <div
          className="card"
          style={{ borderColor: "#3b7a57", borderWidth: "2px" }}
        >
          <div
            className="card-header"
            style={{ backgroundColor: "#eef7ee", borderColor: "#3b7a57" }}
          >
            <h5 className="card-title mb-0" style={{ color: "#2f6f44" }}>
              All Awards
            </h5>
          </div>
          <div className="card-body">{renderAwardsContent()}</div>
        </div>

        {editingId && (
          <EditAwardCard
            editingId={editingId}
            editFormData={editFormData}
            isSaving={isSaving}
            onChange={handleEditChange}
            onSave={saveEdit}
            onCancel={() => setEditingId(null)}
          />
        )}
      </div>
    </div>
  )
}

export default AwardManagementPage

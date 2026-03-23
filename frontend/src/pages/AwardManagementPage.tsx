import { JSX } from "react"
import { AWARD_MANAGEMENT_STYLES, AWARD_MESSAGES } from "../utils/constants"

// Management sub-components
import { AwardsTable } from "../components/award/management/AwardsTable"
import { EditAwardCard } from "../components/award/management/EditAwardCard"
import { AwardCreationForm } from "../components/award/management/AwardCreationForm"

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
    form,
    onCreate,
    isCreating,
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

        <AwardCreationForm
          form={form}
          onCreate={onCreate}
          isCreating={isCreating}
        />

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

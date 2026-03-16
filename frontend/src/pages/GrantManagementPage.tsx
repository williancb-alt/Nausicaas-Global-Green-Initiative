import { JSX } from "react"
import { DynamicFieldModal } from "../components/dynamicFields/DynamicFieldModal"
import { GRANT_MANAGEMENT_STYLES } from "../utils/constants"

// Management sub-components
import { GrantCreationForm } from "../components/grant/management/GrantCreationForm"
import { GrantList } from "../components/grant/management/GrantList"
import { GrantEditArea } from "../components/grant/management/GrantEditArea"

// Hooks
import { useGrantManagement } from "../hooks/useGrantManagement"

export function GrantManagementPage(): JSX.Element {
  const {
    grants,
    isLoading,
    form,
    onCreate,
    editingId,
    setEditingId,
    editFormData,
    startEdit,
    handleEditChange,
    saveEdit,
    isSaving,
    onDelete,
    toggleVisibility,
    togglingGrant,
    customFieldConfigs,
    customFieldValues,
    editCustomFieldConfigs,
    editCustomFieldValues,
    handleFieldAdd,
    handleRemoveField,
    setFieldValue,
    isFieldModalOpen,
    setIsFieldModalOpen,
  } = useGrantManagement()

  return (
    <div style={GRANT_MANAGEMENT_STYLES.pageBg} className="py-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0" style={GRANT_MANAGEMENT_STYLES.header}>
            Grant Management
          </h1>
          <span className="badge" style={GRANT_MANAGEMENT_STYLES.badge}>
            {grants.length} grants
          </span>
        </div>

        <GrantCreationForm
          form={form}
          onCreate={onCreate}
          customFieldConfigs={customFieldConfigs}
          customFieldValues={customFieldValues}
          setFieldValue={(l, v) => setFieldValue(l, v)}
          handleRemoveField={idx => handleRemoveField(idx)}
          setIsFieldModalOpen={setIsFieldModalOpen}
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
              All Grants
            </h5>
          </div>
          <div className="card-body">
            <GrantList
              grants={grants}
              isLoading={isLoading}
              onEdit={startEdit}
              onToggleVisibility={toggleVisibility}
              onDelete={onDelete}
              togglingGrant={togglingGrant}
            />
          </div>
        </div>

        {editingId && (
          <GrantEditArea
            editingId={editingId}
            editFormData={editFormData}
            handleEditChange={handleEditChange}
            isPending={isSaving}
            onSave={saveEdit}
            onCancel={() => setEditingId(null)}
            customFieldConfigs={editCustomFieldConfigs}
            customFieldValues={editCustomFieldValues}
            setFieldValue={(l, v) => setFieldValue(l, v, true)}
            handleRemoveField={idx => handleRemoveField(idx, true)}
            setIsFieldModalOpen={setIsFieldModalOpen}
          />
        )}

        <DynamicFieldModal
          isOpen={isFieldModalOpen}
          onClose={() => setIsFieldModalOpen(false)}
          onFieldAdd={handleFieldAdd}
        />
      </div>
    </div>
  )
}

export default GrantManagementPage

import { JSX } from "react"
import { UseFormReturn } from "react-hook-form"
import { Plus } from "lucide-react"
import type { DynamicFieldConfig } from "../../../types"
import { CreateGrantFormData } from "../../../schemas/grantSchema"
import { GRANT_MANAGEMENT_STYLES } from "../../../utils/constants"
import { BaseGrantFields } from "./BaseGrantFields"
import { CustomFieldManagement } from "./CustomFieldManagement"

interface GrantCreationFormProps {
  form: UseFormReturn<CreateGrantFormData>
  onCreate: (data: CreateGrantFormData) => void
  customFieldConfigs: DynamicFieldConfig[]
  customFieldValues: Record<string, string>
  setFieldValue: (label: string, value: string) => void
  handleRemoveField: (index: number) => void
  setIsFieldModalOpen: (open: boolean) => void
}

/**
 * Component for the Grant Creation Form.
 */
export function GrantCreationForm({
  form,
  onCreate,
  customFieldConfigs,
  customFieldValues,
  setFieldValue,
  handleRemoveField,
  setIsFieldModalOpen,
}: GrantCreationFormProps): JSX.Element {
  const { handleSubmit } = form

  return (
    <div className="card mb-4" style={GRANT_MANAGEMENT_STYLES.card}>
      <div className="card-header" style={GRANT_MANAGEMENT_STYLES.cardHeader}>
        <h5
          className="card-title mb-0 d-flex align-items-center gap-2"
          style={{ color: "#2f6f44" }}
        >
          <Plus size={18} /> Create New Grant
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={e => void handleSubmit(onCreate)(e)}>
          <BaseGrantFields form={form} />

          <CustomFieldManagement
            configs={customFieldConfigs}
            values={customFieldValues}
            onSetValue={setFieldValue}
            onRemove={handleRemoveField}
            onOpenModal={() => setIsFieldModalOpen(true)}
          />

          <div className="mt-4 text-end">
            <button
              type="submit"
              className="btn"
              style={GRANT_MANAGEMENT_STYLES.btnPrimary}
            >
              Create Grant
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

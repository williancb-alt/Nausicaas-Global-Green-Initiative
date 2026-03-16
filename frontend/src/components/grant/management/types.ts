import { GRANT_FORM_FIELDS } from "../../../utils/constants"
import type { DynamicFieldConfig } from "../../../types"
import type { Grant } from "../../../services/api/client"

export type GrantEditField =
  | typeof GRANT_FORM_FIELDS.DEADLINE
  | typeof GRANT_FORM_FIELDS.DESCRIPTION

export interface GrantEditAreaProps {
  editingId: string
  editFormData: { name: string; deadline: string; description: string }
  handleEditChange: (field: GrantEditField, value: string) => void
  isPending: boolean
  onSave: () => void
  onCancel: () => void
  customFieldConfigs: DynamicFieldConfig[]
  customFieldValues: Record<string, string>
  setFieldValue: (label: string, value: string) => void
  handleRemoveField: (index: number) => void
  setIsFieldModalOpen: (open: boolean) => void
}

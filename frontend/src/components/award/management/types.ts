import { AWARD_FORM_FIELDS } from "../../../utils/constants"
import type { Award } from "../../../services/api/client"

export type AwardEditField =
  | typeof AWARD_FORM_FIELDS.DEADLINE
  | typeof AWARD_FORM_FIELDS.DESCRIPTION

export interface EditFormData {
  name: string
  deadline: string
  description: string
}

export interface AwardRowProps {
  award: Award
  togglingAward: string | null
  onEdit: (award: Award) => void
  onToggleVisibility: (award: Award) => void
  onDelete: (name: string) => void
}

export interface AwardsTableProps {
  awards: Award[]
  togglingAward: string | null
  onEdit: (award: Award) => void
  onToggleVisibility: (award: Award) => void
  onDelete: (name: string) => void
}

export interface EditAwardCardProps {
  editingId: string
  editFormData: EditFormData
  isSaving: boolean
  onChange: (field: AwardEditField, value: string) => void
  onSave: () => void
  onCancel: () => void
}

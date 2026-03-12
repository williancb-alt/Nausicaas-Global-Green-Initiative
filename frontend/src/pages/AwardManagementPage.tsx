import { JSX, useState } from "react"
import {
  useAwards,
  useCreateAward,
  useUpdateAward,
  useDeleteAward,
} from "../hooks/useAwardHooks"
import { useAwardsStore } from "../store/awardsStore"
import { useForm } from "react-hook-form"
import {
  createAwardSchema,
  type CreateAwardFormData,
} from "../schemas/awardSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Edit2, Trash2, Eye, EyeOff, Plus } from "lucide-react"
import type { UpdateAwardParams } from "../types"
import type { Award } from "../services/api/client"
import {
  AWARD_FORM_FIELDS,
  AWARD_MANAGEMENT_STYLES,
  AWARD_MESSAGES,
} from "../utils/constants"

type AwardEditField =
  | typeof AWARD_FORM_FIELDS.DEADLINE
  | typeof AWARD_FORM_FIELDS.DESCRIPTION

type EditFormData = {
  name: string
  deadline: string
  description: string
}

type AlertMessageProps = {
  message: string
}

type VisibilityBadgeProps = {
  hidden?: boolean
}

type AwardRowProps = {
  award: Award
  togglingAward: string | null
  onEdit: (award: Award) => void
  onToggleVisibility: (award: Award) => void
  onDelete: (name: string) => void
}

type AwardsTableProps = {
  awards: Award[]
  togglingAward: string | null
  onEdit: (award: Award) => void
  onToggleVisibility: (award: Award) => void
  onDelete: (name: string) => void
}

type EditAwardCardProps = {
  editingId: string
  editFormData: EditFormData
  isSaving: boolean
  onChange: (field: AwardEditField, value: string) => void
  onSave: () => void
  onCancel: () => void
}

function buildUpdatePayload(
  editingId: string,
  editFormData: EditFormData,
): UpdateAwardParams {
  const payload: UpdateAwardParams = { name: editingId }

  if (editFormData.deadline) {
    payload.deadline = editFormData.deadline
  }

  if (editFormData.description) {
    payload.description = editFormData.description
  }

  return payload
}

function AlertMessage({ message }: AlertMessageProps): JSX.Element {
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

function VisibilityBadge({ hidden }: VisibilityBadgeProps): JSX.Element {
  return (
    <span
      className="badge"
      style={{
        backgroundColor: hidden ? "#9ca3af" : "#3b7a57",
        color: "white",
      }}
    >
      {hidden ? "Hidden" : "Visible"}
    </span>
  )
}

function AwardRow({
  award,
  togglingAward,
  onEdit,
  onToggleVisibility,
  onDelete,
}: AwardRowProps): JSX.Element {
  const isToggling = togglingAward === award.name

  return (
    <tr>
      <td>
        <strong style={{ color: "#2f6f44" }}>{award.name}</strong>
      </td>

      <td>{award.deadline || "—"}</td>

      <td>{award.description || "—"}</td>

      <td>
        <VisibilityBadge hidden={award.hidden || false} />
      </td>

      <td>
        <div className="d-flex gap-1">
          <button
            className="btn btn-sm"
            style={{
              backgroundColor: "#eef7ee",
              color: "#2f6f44",
              border: "none",
            }}
            onClick={() => onEdit(award)}
            title="Edit award"
            type="button"
          >
            <Edit2 size={14} />
          </button>
          <button
            className="btn btn-sm"
            style={{
              backgroundColor: "#eef7ee",
              color: "#2f6f44",
              border: "none",
            }}
            onClick={() => onToggleVisibility(award)}
            title={award.hidden ? "Show award" : "Hide award"}
            disabled={isToggling}
            type="button"
          >
            {isToggling ? (
              "..."
            ) : award.hidden ? (
              <EyeOff size={14} />
            ) : (
              <Eye size={14} />
            )}
          </button>
          <button
            className="btn btn-sm"
            style={{
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              border: "none",
            }}
            onClick={() => onDelete(award.name)}
            title="Delete award"
            type="button"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

function AwardsTable({
  awards,
  togglingAward,
  onEdit,
  onToggleVisibility,
  onDelete,
}: AwardsTableProps): JSX.Element {
  return (
    <div className="table-responsive">
      <table
        className="table table-hover table-sm"
        style={{ backgroundColor: "white" }}
      >
        <thead style={{ backgroundColor: "#eef7ee" }}>
          <tr>
            <th style={{ color: "#2f6f44" }}>Name</th>
            <th style={{ color: "#2f6f44" }}>Deadline</th>
            <th style={{ color: "#2f6f44" }}>Description</th>
            <th style={{ color: "#2f6f44" }}>Visibility</th>
            <th style={{ color: "#2f6f44", width: "180px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {awards.map(award => (
            <AwardRow
              key={award.name}
              award={award}
              togglingAward={togglingAward}
              onEdit={onEdit}
              onToggleVisibility={onToggleVisibility}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EditAwardCard({
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

export function AwardManagementPage(): JSX.Element {
  const { data: awardsData, isLoading } = useAwards()
  const createAward = useCreateAward()
  const updateAward = useUpdateAward()
  const deleteAward = useDeleteAward()
  const { setCurrentPage } = useAwardsStore()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: "",
    deadline: "",
    description: "",
  })
  const [togglingAward, setTogglingAward] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAwardFormData>({
    resolver: zodResolver(createAwardSchema),
  })

  const awards = awardsData?.items ?? []

  const onCreate = (data: CreateAwardFormData) => {
    createAward.mutate(data, {
      onSuccess: () => {
        reset()
        setCurrentPage(1)
      },
    })
  }

  const startEdit = (award: Award) => {
    setEditingId(award.name)
    setEditFormData({
      name: award.name,
      deadline: award.deadline || "",
      description: award.description || "",
    })
  }

  const handleEditChange = (field: AwardEditField, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }))
  }

  const clearEdit = () => {
    setEditingId(null)
  }

  const saveEdit = () => {
    if (!editingId) {
      return
    }

    updateAward.mutate(buildUpdatePayload(editingId, editFormData), {
      onSuccess: clearEdit,
      onError: error => {
        alert(AWARD_MESSAGES.saveError(error.message))
      },
    })
  }

  const onDelete = (name: string) => {
    if (window.confirm(AWARD_MESSAGES.deleteConfirm(name))) {
      deleteAward.mutate(name)
    }
  }

  const resetTogglingAward = () => {
    setTogglingAward(null)
  }

  const toggleVisibility = (award: Award) => {
    setTogglingAward(award.name)

    updateAward.mutate(
      {
        name: award.name,
        hidden: !award.hidden,
      },
      {
        onSuccess: resetTogglingAward,
        onError: error => {
          alert(AWARD_MESSAGES.toggleError(error.message))
          resetTogglingAward()
        },
      },
    )
  }

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
                  <label
                    className="form-label"
                    style={{ color: "#2f6f44", fontWeight: "500" }}
                  >
                    Description
                  </label>
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
            isSaving={updateAward.isPending}
            onChange={handleEditChange}
            onSave={saveEdit}
            onCancel={clearEdit}
          />
        )}
      </div>
    </div>
  )
}

export default AwardManagementPage

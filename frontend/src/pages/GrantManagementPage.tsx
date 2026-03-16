import { JSX, useState } from "react" // CI Refresh
import {
  useGrants,
  useCreateGrant,
  useUpdateGrant,
  useDeleteGrant,
} from "../hooks/useGrantHooks"
import { useGrantsStore } from "../store/grantsStore"
import { useForm, UseFormReturn } from "react-hook-form"
import {
  createGrantSchema,
  type CreateGrantFormData,
} from "../schemas/grantSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Edit2, Trash2, Eye, EyeOff, Plus } from "lucide-react"
import { DynamicFieldModal } from "../components/dynamicFields/DynamicFieldModal"
import { DynamicFieldPreview } from "../components/dynamicFields/DynamicFieldPreview"
import { DynamicFieldInput } from "../components/dynamicFields/DynamicFieldInput"
import type { DynamicFieldConfig, UpdateGrantParams } from "../types"
import type { Grant } from "../services/api/client"
import {
  GRANT_FORM_FIELDS,
  GRANT_MANAGEMENT_STYLES,
  GRANT_MESSAGES,
} from "../utils/constants"

type GrantEditField =
  | typeof GRANT_FORM_FIELDS.DEADLINE
  | typeof GRANT_FORM_FIELDS.DESCRIPTION

/**
 * Component for the Grant Creation Form.
 */
function GrantCreationForm({
  form,
  onCreate,
  customFieldConfigs,
  customFieldValues,
  setFieldValue,
  handleRemoveField,
  setIsFieldModalOpen,
}: {
  form: UseFormReturn<CreateGrantFormData>
  onCreate: (data: CreateGrantFormData) => void
  customFieldConfigs: DynamicFieldConfig[]
  customFieldValues: Record<string, string>
  setFieldValue: (label: string, value: string) => void
  handleRemoveField: (index: number) => void
  setIsFieldModalOpen: (open: boolean) => void
}): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

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
          <div className="row g-3">
            <div className="col-md-3">
              <label
                className="form-label"
                style={{ color: "#2f6f44", fontWeight: "500" }}
              >
                Grant Name
              </label>
              <input
                {...register(GRANT_FORM_FIELDS.NAME)}
                placeholder="Grant name"
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                style={GRANT_MANAGEMENT_STYLES.input}
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
                {...register(GRANT_FORM_FIELDS.DEADLINE)}
                placeholder="MM/DD/YY"
                className={`form-control ${errors.deadline ? "is-invalid" : ""}`}
                style={GRANT_MANAGEMENT_STYLES.input}
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
                {...register(GRANT_FORM_FIELDS.DESCRIPTION)}
                placeholder="Grant description"
                className={`form-control ${errors.description ? "is-invalid" : ""}`}
                rows={1}
                style={GRANT_MANAGEMENT_STYLES.input}
              />
              {errors.description && (
                <div className="invalid-feedback d-block">
                  {errors.description.message}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label
                className="form-label mb-0"
                style={{ color: "#2f6f44", fontWeight: 600 }}
              >
                Custom Fields
              </label>
              <div>
                <button
                  type="button"
                  className="btn btn-sm me-2"
                  style={GRANT_MANAGEMENT_STYLES.btnPrimary}
                  onClick={() => setIsFieldModalOpen(true)}
                >
                  Add Field
                </button>
                <button
                  type="submit"
                  className="btn btn-sm"
                  style={GRANT_MANAGEMENT_STYLES.btnPrimary}
                >
                  Create Grant
                </button>
              </div>
            </div>

            <DynamicFieldPreview fields={customFieldConfigs} />
            {customFieldConfigs.map((f, idx) => (
              <div key={idx} className="d-flex align-items-start gap-2">
                <div className="flex-grow-1">
                  <DynamicFieldInput
                    field={f}
                    index={idx}
                    value={customFieldValues[f.label] || ""}
                    onChange={v => setFieldValue(f.label, v)}
                  />
                </div>
                <div>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => handleRemoveField(idx)}
                  >
                    -
                  </button>
                </div>
              </div>
            ))}
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * Component for listing existing grants in a table.
 */
function GrantList({
  grants,
  isLoading,
  onEdit,
  onToggleVisibility,
  onDelete,
  togglingGrant,
}: {
  grants: Grant[]
  isLoading: boolean
  onEdit: (grant: Grant) => void
  onToggleVisibility: (grant: Grant) => void
  onDelete: (name: string) => void
  togglingGrant: string | null
}): JSX.Element {
  if (isLoading) {
    return (
      <div
        className="alert"
        style={{
          backgroundColor: "#eef7ee",
          color: "#2f6f44",
          border: "1px solid #3b7a57",
        }}
      >
        {GRANT_MESSAGES.loadingGrants}
      </div>
    )
  }

  if (grants.length === 0) {
    return (
      <div
        className="alert"
        style={{
          backgroundColor: "#eef7ee",
          color: "#2f6f44",
          border: "1px solid #3b7a57",
        }}
      >
        {GRANT_MESSAGES.noGrants}
      </div>
    )
  }

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
            <th style={{ color: "#2f6f44" }}>Visibility</th>
            <th style={{ color: "#2f6f44", width: "180px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {grants.map(grant => (
            <tr key={grant.name}>
              <td>
                <strong style={{ color: "#2f6f44" }}>{grant.name}</strong>
                <br />
                <small className="text-muted">{grant.description || "—"}</small>
              </td>
              <td>{grant.deadline || "—"}</td>
              <td>
                <span
                  className="badge"
                  style={{
                    backgroundColor: grant.hidden ? "#9ca3af" : "#3b7a57",
                    color: "white",
                  }}
                >
                  {grant.hidden ? "Hidden" : "Visible"}
                </span>
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
                    onClick={() => onEdit(grant)}
                    title="Edit grant"
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
                    onClick={() => onToggleVisibility(grant)}
                    title={grant.hidden ? "Show grant" : "Hide grant"}
                    disabled={togglingGrant === grant.name}
                  >
                    {togglingGrant === grant.name ? (
                      "..."
                    ) : grant.hidden ? (
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
                    onClick={() => onDelete(grant.name)}
                    title="Delete grant"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Component for the Grant Editing Area.
 */
function GrantEditArea({
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
}: {
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
}): JSX.Element {
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

        <div className="mt-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label
              className="form-label mb-0"
              style={{ color: "#2f6f44", fontWeight: 600 }}
            >
              Custom Fields
            </label>
            <button
              type="button"
              className="btn btn-sm"
              style={{ backgroundColor: "#3b7a57", color: "white" }}
              onClick={() => setIsFieldModalOpen(true)}
            >
              Add Field
            </button>
          </div>

          <DynamicFieldPreview fields={customFieldConfigs} />
          {customFieldConfigs.map((f, idx) => (
            <div key={idx} className="d-flex align-items-start gap-2 mb-2">
              <div className="flex-grow-1">
                <DynamicFieldInput
                  field={f}
                  index={idx}
                  value={customFieldValues[f.label] || ""}
                  onChange={v => setFieldValue(f.label, v)}
                />
              </div>
              <div>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => handleRemoveField(idx)}
                >
                  -
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="d-flex gap-2 mt-3">
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

export function GrantManagementPage(): JSX.Element {
  const { data: grantsData, isLoading } = useGrants()
  const createGrant = useCreateGrant()
  const updateGrant = useUpdateGrant()
  const deleteGrant = useDeleteGrant()
  const { setCurrentPage } = useGrantsStore()

  // page-level state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: "",
    deadline: "",
    description: "",
  })
  const [togglingGrant, setTogglingGrant] = useState<string | null>(null)

  // Dynamic fields for create and edit flows
  const [customFieldConfigs, setCustomFieldConfigs] = useState<
    DynamicFieldConfig[]
  >([])
  const [customFieldValues, setCustomFieldValues] = useState<
    Record<string, string>
  >({})

  const [editCustomFieldConfigs, setEditCustomFieldConfigs] = useState<
    DynamicFieldConfig[]
  >([])
  const [editCustomFieldValues, setEditCustomFieldValues] = useState<
    Record<string, string>
  >({})

  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false)

  const form = useForm<CreateGrantFormData>({
    resolver: zodResolver(createGrantSchema),
  })

  const grants = grantsData?.items ?? []

  // Create
  const onCreate = (data: CreateGrantFormData) => {
    const payload = {
      ...data,
      custom_fields: JSON.stringify({
        configs: customFieldConfigs,
        values: customFieldValues,
      }),
    }

    createGrant.mutate(payload, {
      onSuccess: () => {
        form.reset()
        setCustomFieldConfigs([])
        setCustomFieldValues({})
        setCurrentPage(1)
      },
    })
  }

  // Edit
  const startEdit = (grant: Grant) => {
    setEditingId(grant.name)
    setEditFormData({
      name: grant.name,
      deadline: grant.deadline || "",
      description: grant.description || "",
    })

    try {
      if (grant.custom_fields) {
        const parsed =
          typeof grant.custom_fields === "string"
            ? (JSON.parse(grant.custom_fields) as {
              configs?: DynamicFieldConfig[]
              values?: Record<string, string>
            })
            : grant.custom_fields
        setEditCustomFieldConfigs(parsed.configs ?? [])
        setEditCustomFieldValues(parsed.values ?? {})
      } else {
        setEditCustomFieldConfigs([])
        setEditCustomFieldValues({})
      }
    } catch {
      setEditCustomFieldConfigs([])
      setEditCustomFieldValues({})
    }
  }

  const handleEditChange = (field: GrantEditField, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }))
  }

  const saveEdit = () => {
    if (!editingId) return
    const payload: UpdateGrantParams = {
      name: editingId,
    }

    if (editFormData.deadline) payload.deadline = editFormData.deadline
    if (editFormData.description) payload.description = editFormData.description

    payload.custom_fields = JSON.stringify({
      configs: editCustomFieldConfigs,
      values: editCustomFieldValues,
    })

    updateGrant.mutate(payload, {
      onSuccess: () => {
        setEditingId(null)
      },
      onError: error => {
        alert(GRANT_MESSAGES.saveError(error.message))
      },
    })
  }

  const onDelete = (name: string) => {
    if (!window.confirm(GRANT_MESSAGES.deleteConfirm(name))) {
      return
    }
    deleteGrant.mutate(name)
  }

  const toggleVisibility = (grant: Grant) => {
    const newHiddenState = !grant.hidden
    setTogglingGrant(grant.name)
    updateGrant.mutate(
      {
        name: grant.name,
        hidden: newHiddenState,
      },
      {
        onSuccess: () => {
          setTogglingGrant(null)
        },
        onError: error => {
          alert(GRANT_MESSAGES.toggleError(error.message))
          setTogglingGrant(null)
        },
      },
    )
  }

  // Dynamic field helpers
  const handleFieldAdd = (config: DynamicFieldConfig) => {
    if (editingId) {
      setEditCustomFieldConfigs(prev => [...prev, config])
    } else {
      setCustomFieldConfigs(prev => [...prev, config])
    }
  }

  const handleRemoveField = (index: number, forEdit = false) => {
    if (forEdit) {
      setEditCustomFieldConfigs(prev => prev.filter((_, i) => i !== index))
      setEditCustomFieldValues(prev => {
        const next = { ...prev }
        const key = editCustomFieldConfigs[index]?.label
        if (key) delete next[key]
        return next
      })
    } else {
      setCustomFieldConfigs(prev => prev.filter((_, i) => i !== index))
      setCustomFieldValues(prev => {
        const next = { ...prev }
        const key = customFieldConfigs[index]?.label
        if (key) delete next[key]
        return next
      })
    }
  }

  const setFieldValue = (label: string, value: string, forEdit = false) => {
    if (forEdit) {
      setEditCustomFieldValues(prev => ({ ...prev, [label]: value }))
    } else {
      setCustomFieldValues(prev => ({ ...prev, [label]: value }))
    }
  }

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
            isPending={updateGrant.isPending}
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

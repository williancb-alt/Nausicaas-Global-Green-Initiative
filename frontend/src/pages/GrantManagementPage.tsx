import { JSX, useState } from "react"
import { useGrants, useCreateGrant, useUpdateGrant, useDeleteGrant } from "../hooks/useGrantHooks"
import { useGrantsStore } from "../store/grantsStore"
import { useForm } from "react-hook-form"
import { createGrantSchema, type CreateGrantFormData } from "../schemas/grantSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Edit2, Trash2, Eye, EyeOff, Plus } from "lucide-react"
import { DynamicFieldModal } from "../components/dynamicFields/DynamicFieldModal"
import { DynamicFieldPreview } from "../components/dynamicFields/DynamicFieldPreview"
import { DynamicFieldInput } from "../components/dynamicFields/DynamicFieldInput"
import type { DynamicFieldConfig } from "../types"

export function GrantManagementPage(): JSX.Element {
  const { data: grantsData, isLoading } = useGrants()
  const createGrant = useCreateGrant()
  const updateGrant = useUpdateGrant()
  const deleteGrant = useDeleteGrant()
  const { setCurrentPage } = useGrantsStore()

  // page-level state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState({ name: "", deadline: "", description: "" })
  const [togglingGrant, setTogglingGrant] = useState<string | null>(null)

  // Dynamic fields for create and edit flows
  const [customFieldConfigs, setCustomFieldConfigs] = useState<DynamicFieldConfig[]>([])
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({})

  const [editCustomFieldConfigs, setEditCustomFieldConfigs] = useState<DynamicFieldConfig[]>([])
  const [editCustomFieldValues, setEditCustomFieldValues] = useState<Record<string, string>>({})

  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateGrantFormData>({
    resolver: zodResolver(createGrantSchema),
  })

  const grants = grantsData?.items ?? []

// Create
  const onCreate = (data: CreateGrantFormData) => {
    const payload = {
      ...data,
      custom_fields: JSON.stringify({ configs: customFieldConfigs, values: customFieldValues }),
    }

    createGrant.mutate(payload, {
      onSuccess: () => {
        reset()
        setCustomFieldConfigs([])
        setCustomFieldValues({})
        setCurrentPage(1)
      },
    })
  }

  // Edit
  const startEdit = (grant: any) => {
    setEditingId(grant.name)
    setEditFormData({
      name: grant.name,
      deadline: grant.deadline || "",
      description: grant.description || "",
    })

    // prepopulate dynamic fields if present
    try {
      if (grant.custom_fields) {
        const parsed = typeof grant.custom_fields === "string" ? JSON.parse(grant.custom_fields) : grant.custom_fields
        setEditCustomFieldConfigs(parsed.configs || [])
        setEditCustomFieldValues(parsed.values || {})
      } else {
        setEditCustomFieldConfigs([])
        setEditCustomFieldValues({})
      }
    } catch (e) {
      setEditCustomFieldConfigs([])
      setEditCustomFieldValues({})
    }
  }

  const handleEditChange = (field: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }))
  }

  const saveEdit = () => {
    if (!editingId) return
    const payload: any = {
      name: editingId,
    }

    // Only include fields that have values
    if (editFormData.deadline) payload.deadline = editFormData.deadline
    if (editFormData.description) payload.description = editFormData.description

    // Always include custom_fields if there are configs
    payload.custom_fields = JSON.stringify({
      configs: editCustomFieldConfigs,
      values: editCustomFieldValues
    })

    console.log('Saving grant edits:', payload)
    updateGrant.mutate(payload, {
      onSuccess: () => {
        console.log('Successfully saved edits')
        setEditingId(null)
      },
      onError: (error) => {
        console.error('Failed to save edits:', error)
        alert(`Failed to save changes: ${error.message}`)
      }
    })
  }

  const onDelete = (name: string) => {
    deleteGrant.mutate(name)
  }

  const toggleVisibility = (grant: any) => {
    const newHiddenState = !grant.hidden
    console.log('Toggling visibility for grant:', grant.name, 'from', grant.hidden, 'to', newHiddenState)
    setTogglingGrant(grant.name)
    updateGrant.mutate(
      {
        name: grant.name,
        hidden: newHiddenState,
      },
      {
        onSuccess: () => {
          console.log('Successfully toggled visibility for:', grant.name)
          setTogglingGrant(null)
        },
        onError: (error) => {
          console.error('Failed to toggle visibility:', error)
          alert(`Failed to toggle visibility: ${error.message}`)
          setTogglingGrant(null)
        },
      }
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
      // also remove value
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
    <div style={{ backgroundColor: "#eef7ee", minHeight: "100vh" }} className="py-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0" style={{ color: "#2f6f44", fontWeight: "700" }}>Grant Management</h1>
          <span className="badge" style={{ backgroundColor: "#3b7a57", color: "white", fontSize: "0.95rem" }}>{grants.length} grants</span>
        </div>

        {/* Create Grant Form */}
        <div className="card mb-4" style={{ borderColor: "#3b7a57", borderWidth: "2px" }}>
          <div className="card-header" style={{ backgroundColor: "#eef7ee", borderColor: "#3b7a57" }}>
            <h5 className="card-title mb-0 d-flex align-items-center gap-2" style={{ color: "#2f6f44" }}>
              <Plus size={18} /> Create New Grant
            </h5>
          </div>
          <div className="card-body">
            <form onSubmit={(e) => void handleSubmit(onCreate)(e as any)}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label" style={{ color: "#2f6f44", fontWeight: "500" }}>Grant Name</label>
                  <input
                    {...register("name")}
                    placeholder="Grant name"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    style={{ borderColor: "#3b7a57" }}
                  />
                  {errors.name && <div className="invalid-feedback d-block">{errors.name.message}</div>}
                </div>

                <div className="col-md-3">
                  <label className="form-label" style={{ color: "#2f6f44", fontWeight: "500" }}>Deadline</label>
                  <input
                    {...register("deadline")}
                    placeholder="MM/DD/YY"
                    className={`form-control ${errors.deadline ? "is-invalid" : ""}`}
                    style={{ borderColor: "#3b7a57" }}
                  />
                  {errors.deadline && <div className="invalid-feedback d-block">{errors.deadline.message}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label" style={{ color: "#2f6f44", fontWeight: "500" }}>Description</label>
                  <textarea
                    {...register("description")}
                    placeholder="Grant description"
                    className={`form-control ${errors.description ? "is-invalid" : ""}`}
                    rows={1}
                    style={{ borderColor: "#3b7a57" }}
                  />
                  {errors.description && <div className="invalid-feedback d-block">{errors.description.message}</div>}
                </div>
              </div>

              {/* Custom fields area */}
              <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label mb-0" style={{ color: "#2f6f44", fontWeight: 600 }}>Custom Fields</label>
                  <div>
                    <button type="button" className="btn btn-sm me-2" style={{ backgroundColor: "#3b7a57", color: "white" }} onClick={() => setIsFieldModalOpen(true)}>Add Field</button>
                    <button type="submit" className="btn btn-sm" style={{ backgroundColor: "#3b7a57", color: "white" }}>Create Grant</button>
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
                        onChange={(v) => setFieldValue(f.label, v)}
                      />
                    </div>
                    <div>
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => handleRemoveField(idx)}>-</button>
                    </div>
                  </div>
                ))}
              </div>
            </form>
          </div>
        </div>

        {/* Grants List */}
        <div className="card" style={{ borderColor: "#3b7a57", borderWidth: "2px" }}>
          <div className="card-header" style={{ backgroundColor: "#eef7ee", borderColor: "#3b7a57" }}>
            <h5 className="card-title mb-0" style={{ color: "#2f6f44" }}>All Grants</h5>
          </div>
          <div className="card-body">
            {isLoading ? (
              <div className="alert" style={{ backgroundColor: "#eef7ee", color: "#2f6f44", border: "1px solid #3b7a57" }}>Loading grants...</div>
            ) : grants.length === 0 ? (
              <div className="alert" style={{ backgroundColor: "#eef7ee", color: "#2f6f44", border: "1px solid #3b7a57" }}>No grants created yet. Create one above to get started.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-sm" style={{ backgroundColor: "white" }}>
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
                    {grants.map(grant => (
                      <tr key={grant.name}>
                        <td>
                          <strong style={{ color: "#2f6f44" }}>{grant.name}</strong>
                          <br />
                          <small className="text-muted">{grant.description || "—"}</small>
                        </td>

                        <td>{grant.deadline || "—"}</td>

                        <td>
                          <span className="badge" style={{ backgroundColor: grant.hidden ? "#9ca3af" : "#3b7a57", color: "white" }}>
                            {grant.hidden ? "Hidden" : "Visible"}
                          </span>
                        </td>

                        <td>
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-sm"
                              style={{ backgroundColor: "#eef7ee", color: "#2f6f44", border: "none" }}
                              onClick={() => startEdit(grant)}
                              title="Edit grant"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{ backgroundColor: "#eef7ee", color: "#2f6f44", border: "none" }}
                              onClick={() => toggleVisibility(grant)}
                              title={grant.hidden ? "Show grant" : "Hide grant"}
                              disabled={togglingGrant === grant.name}
                            >
                              {togglingGrant === grant.name ? "..." : (grant.hidden ? <EyeOff size={14} /> : <Eye size={14} />)}
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{ backgroundColor: "#fee2e2", color: "#dc2626", border: "none" }}
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
            )}
          </div>
        </div>

        {/* Edit Area (inline) */}
        {editingId && (
          <div className="card mt-4" style={{ borderColor: "#3b7a57", borderWidth: "2px" }}>
            <div className="card-header" style={{ backgroundColor: "#3b7a57", color: "white" }}>
              <h5 className="card-title mb-0">Edit Grant: {editingId}</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label" style={{ color: "#2f6f44", fontWeight: "500" }}>Name</label>
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
                  <label className="form-label" style={{ color: "#2f6f44", fontWeight: "500" }}>Deadline</label>
                    <input
                    type="text"
                    className="form-control"
                    value={editFormData.deadline}
                    onChange={(e) => handleEditChange("deadline", e.target.value)}
                    placeholder="MM/DD/YY"
                    style={{ borderColor: "#3b7a57" }}
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label" style={{ color: "#2f6f44", fontWeight: "500" }}>Description</label>
                  <textarea
                    className="form-control"
                    value={editFormData.description}
                    onChange={(e) => handleEditChange("description", e.target.value)}
                    placeholder="Grant description"
                    rows={3}
                    style={{ borderColor: "#3b7a57" }}
                  />
                </div>
              </div>

              {/* Custom fields for edit */}
              <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label mb-0" style={{ color: "#2f6f44", fontWeight: 600 }}>Custom Fields</label>
                  <button type="button" className="btn btn-sm" style={{ backgroundColor: "#3b7a57", color: "white" }} onClick={() => setIsFieldModalOpen(true)}>Add Field</button>
                </div>

                <DynamicFieldPreview fields={editCustomFieldConfigs} />
                {editCustomFieldConfigs.map((f, idx) => (
                  <div key={idx} className="d-flex align-items-start gap-2 mb-2">
                    <div className="flex-grow-1">
                      <DynamicFieldInput
                        field={f}
                        index={idx}
                        value={editCustomFieldValues[f.label] || ""}
                        onChange={(v) => setFieldValue(f.label, v, true)}
                      />
                    </div>
                    <div>
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => handleRemoveField(idx, true)}>-</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="d-flex gap-2 mt-3">
                <button className="btn" style={{ backgroundColor: "#3b7a57", color: "white" }} onClick={saveEdit} disabled={updateGrant.isPending}>
                  {updateGrant.isPending ? "Saving..." : "Save Changes"}
                </button>
                <button className="btn btn-secondary" onClick={() => setEditingId(null)} disabled={updateGrant.isPending}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
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
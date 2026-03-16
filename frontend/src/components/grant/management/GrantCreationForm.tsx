import { JSX } from "react"
import { UseFormReturn } from "react-hook-form"
import { Plus } from "lucide-react"
import { DynamicFieldPreview } from "../../dynamicFields/DynamicFieldPreview"
import { DynamicFieldInput } from "../../dynamicFields/DynamicFieldInput"
import type { DynamicFieldConfig } from "../../../types"
import { CreateGrantFormData } from "../../../schemas/grantSchema"
import {
  GRANT_FORM_FIELDS,
  GRANT_MANAGEMENT_STYLES,
} from "../../../utils/constants"

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

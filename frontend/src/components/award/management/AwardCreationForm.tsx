import { JSX } from "react"
import { Plus } from "lucide-react"
import { UseFormReturn } from "react-hook-form"
import { CreateAwardFormData } from "../../../schemas/awardSchema"
import {
  AWARD_FORM_FIELDS,
  AWARD_MANAGEMENT_STYLES,
} from "../../../utils/constants"

interface AwardCreationFormProps {
  form: UseFormReturn<CreateAwardFormData>
  onCreate: (data: CreateAwardFormData) => void
  isCreating: boolean
}

export function AwardCreationForm({
  form,
  onCreate,
  isCreating,
}: AwardCreationFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  return (
    <div className="card mb-4" style={AWARD_MANAGEMENT_STYLES.card}>
      <div className="card-header" style={AWARD_MANAGEMENT_STYLES.cardHeader}>
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
  )
}

import { JSX } from "react"
import { UseFormReturn } from "react-hook-form"
import { CreateGrantFormData } from "../../../schemas/grantSchema"
import {
  GRANT_FORM_FIELDS,
  GRANT_MANAGEMENT_STYLES,
} from "../../../utils/constants"

export function BaseGrantFields({
  form,
}: {
  form: UseFormReturn<CreateGrantFormData>
}): JSX.Element {
  const {
    register,
    formState: { errors },
  } = form

  return (
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
          <div className="invalid-feedback d-block">{errors.name.message}</div>
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
  )
}

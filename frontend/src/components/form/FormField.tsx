import { ReactElement, cloneElement, isValidElement } from "react"
import { FieldError } from "react-hook-form"

interface FormFieldProps {
  label: string
  error?: FieldError | undefined
  children: ReactElement<{ className?: string }>
}

export function FormField({ label, error, children }: FormFieldProps) {
  const errorId = `${label.toLowerCase().replace(/\s+/g, "-")}-error`

  const inputWithError = isValidElement(children)
    ? cloneElement(children, {
        className: [children.props.className, error && "is-invalid"]
          .filter(Boolean)
          .join(" "),
      })
    : children

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      {inputWithError}
      {error && (
        <div className="invalid-feedback" id={errorId}>
          {error.message}
        </div>
      )}
    </div>
  )
}

import { JSX, useState, useEffect } from "react"
import { phoneRegex, emailRegex } from "../../schemas/grantSchema"
import type { DynamicFieldConfig } from "../../types"

interface DynamicFieldInputProps {
  field: DynamicFieldConfig
  index: number
  value: string
  onChange: (value: string) => void
  onValidationChange?: (fieldIndex: number, isValid: boolean) => void
}

function FieldLabel({
  label,
  required,
}: {
  label: string
  required: boolean
}): JSX.Element {
  return (
    <label className="form-label">
      {label}
      {required ? (
        <span className="text-danger ms-1">*</span>
      ) : (
        <span className="text-muted ms-1">(Optional)</span>
      )}
    </label>
  )
}

export function DynamicFieldInput({
  field,
  index,
  value,
  onChange,
  onValidationChange,
}: DynamicFieldInputProps): JSX.Element {
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  const isRequired = field.required ?? false

  useEffect(() => {
    if (!onValidationChange) return
    const hasRequiredError = isRequired && touched && !value.trim()
    const hasFormatError = !!error
    onValidationChange(index, !hasRequiredError && !hasFormatError)
  }, [value, error, touched, isRequired, index, onValidationChange])

  const requiredError = "This field is required"

  const checkRequired = (val: string) => isRequired && !val.trim()

  const validateRequired = (newValue: string) => {
    if (touched && checkRequired(newValue)) {
      return requiredError
    }
    return null
  }

  const handleBlur = () => {
    setTouched(true)
    if (checkRequired(value)) {
      setError(requiredError)
    }
  }

  const createPatternHandler =
    (pattern: RegExp, errorMessage: string) => (newValue: string) => {
      onChange(newValue)
      const reqError = validateRequired(newValue)
      if (reqError) {
        setError(reqError)
      } else if (newValue && !pattern.test(newValue)) {
        setError(errorMessage)
      } else {
        setError(null)
      }
    }

  const handlePhoneChange = createPatternHandler(
    phoneRegex,
    "Please enter a valid phone number",
  )

  const handleEmailChange = createPatternHandler(
    emailRegex,
    "Please enter a valid email address",
  )

  if (field.type === "text") {
    const handleTextChange = (newValue: string) => {
      onChange(newValue)
      const reqError = validateRequired(newValue)
      if (reqError) {
        setError(reqError)
      } else {
        setError(null)
      }
    }

    return (
      <div className="mb-3">
        <FieldLabel label={field.label} required={isRequired} />
        <textarea
          className={`form-control ${error && touched ? "is-invalid" : ""}`}
          maxLength={field.maxLength}
          rows={3}
          value={value}
          onChange={e => handleTextChange(e.target.value)}
          onBlur={handleBlur}
        />
        {error && touched && <div className="invalid-feedback">{error}</div>}
        <small className="text-muted">Max {field.maxLength} characters</small>
      </div>
    )
  }

  if (field.type === "radio") {
    const handleRadioChange = (newValue: string) => {
      onChange(newValue)
      setTouched(true)
      setError(null)
    }

    return (
      <div className="mb-3">
        <FieldLabel label={field.label} required={isRequired} />
        {field.options.map((option, optIndex) => (
          <div key={optIndex} className="form-check">
            <input
              type="radio"
              name={`dynamic_field_${index}`}
              value={option}
              checked={value === option}
              onChange={e => handleRadioChange(e.target.value)}
              className="form-check-input"
              id={`field_${index}_option_${optIndex}`}
            />
            <label
              className="form-check-label"
              htmlFor={`field_${index}_option_${optIndex}`}
            >
              {option}
            </label>
          </div>
        ))}
        {error && touched && (
          <div className="text-danger small mt-1">{error}</div>
        )}
      </div>
    )
  }

  if (field.type === "phone") {
    return (
      <div className="mb-3">
        <FieldLabel label={field.label} required={isRequired} />
        <input
          type="tel"
          className={`form-control ${error && touched ? "is-invalid" : ""}`}
          value={value}
          onChange={e => handlePhoneChange(e.target.value)}
          onBlur={handleBlur}
          placeholder="+1 (555) 123-4567"
        />
        {error && touched && <div className="invalid-feedback">{error}</div>}
      </div>
    )
  }

  if (field.type === "currency") {
    const handleCurrencyChange = (newValue: string) => {
      onChange(newValue)
      if (isRequired && !newValue.trim()) {
        setError("This field is required")
      } else if (newValue) {
        const num = parseFloat(newValue)
        if (isNaN(num)) {
          setError("Please enter a valid number")
        } else if (num < field.min) {
          setError(`Amount must be at least €${field.min}`)
        } else if (num > field.max) {
          setError(`Amount must be at most €${field.max}`)
        } else {
          setError(null)
        }
      } else {
        setError(null)
      }
    }

    return (
      <div className="mb-3">
        <FieldLabel label={field.label} required={isRequired} />
        <div className="input-group">
          <span className="input-group-text">€</span>
          <input
            type="number"
            className={`form-control ${error && touched ? "is-invalid" : ""}`}
            value={value}
            onChange={e => handleCurrencyChange(e.target.value)}
            onBlur={handleBlur}
            min={field.min}
            max={field.max}
            step="0.01"
            placeholder="0.00"
          />
          {error && touched && <div className="invalid-feedback">{error}</div>}
        </div>
        <small className="text-muted">
          Range: €{field.min} – €{field.max}
        </small>
      </div>
    )
  }

  // email type
  return (
    <div className="mb-3">
      <FieldLabel label={field.label} required={isRequired} />
      <input
        type="email"
        className={`form-control ${error && touched ? "is-invalid" : ""}`}
        value={value}
        onChange={e => handleEmailChange(e.target.value)}
        onBlur={handleBlur}
        placeholder="email@example.com"
      />
      {error && touched && <div className="invalid-feedback">{error}</div>}
    </div>
  )
}

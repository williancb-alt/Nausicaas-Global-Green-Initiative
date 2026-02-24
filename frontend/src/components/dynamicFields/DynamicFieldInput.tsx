import { JSX, useState } from "react"
import { phoneRegex, emailRegex } from "../../schemas/grantSchema"
import type { DynamicFieldConfig } from "../../types"

interface DynamicFieldInputProps {
  field: DynamicFieldConfig
  index: number
  value: string
  onChange: (value: string) => void
}

export function DynamicFieldInput({
  field,
  index,
  value,
  onChange,
}: DynamicFieldInputProps): JSX.Element {
  const [error, setError] = useState<string | null>(null)

  const handlePhoneChange = (newValue: string) => {
    onChange(newValue)
    if (newValue && !phoneRegex.test(newValue)) {
      setError("Please enter a valid phone number")
    } else {
      setError(null)
    }
  }

  const handleEmailChange = (newValue: string) => {
    onChange(newValue)
    if (newValue && !emailRegex.test(newValue)) {
      setError("Please enter a valid email address")
    } else {
      setError(null)
    }
  }

  if (field.type === "text") {
    return (
      <div className="mb-3">
        <label className="form-label">{field.label}</label>
        <textarea
          className="form-control"
          maxLength={field.maxLength}
          rows={3}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <small className="text-muted">Max {field.maxLength} characters</small>
      </div>
    )
  }

  if (field.type === "radio") {
    return (
      <div className="mb-3">
        <label className="form-label">{field.label}</label>
        {field.options.map((option, optIndex) => (
          <div key={optIndex} className="form-check">
            <input
              type="radio"
              name={`dynamic_field_${index}`}
              value={option}
              checked={value === option}
              onChange={e => onChange(e.target.value)}
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
      </div>
    )
  }

  if (field.type === "phone") {
    return (
      <div className="mb-3">
        <label className="form-label">{field.label}</label>
        <input
          type="tel"
          className={`form-control ${error ? "is-invalid" : ""}`}
          value={value}
          onChange={e => handlePhoneChange(e.target.value)}
          placeholder="+1 (555) 123-4567"
        />
        {error && <div className="invalid-feedback">{error}</div>}
      </div>
    )
  }

  if (field.type === "currency") {
    const handleCurrencyChange = (newValue: string) => {
      onChange(newValue)
      if (newValue) {
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
        <label className="form-label">{field.label}</label>
        <div className="input-group">
          <span className="input-group-text">€</span>
          <input
            type="number"
            className={`form-control ${error ? "is-invalid" : ""}`}
            value={value}
            onChange={e => handleCurrencyChange(e.target.value)}
            min={field.min}
            max={field.max}
            step="0.01"
            placeholder="0.00"
          />
          {error && <div className="invalid-feedback">{error}</div>}
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
      <label className="form-label">{field.label}</label>
      <input
        type="email"
        className={`form-control ${error ? "is-invalid" : ""}`}
        value={value}
        onChange={e => handleEmailChange(e.target.value)}
        placeholder="email@example.com"
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  )
}

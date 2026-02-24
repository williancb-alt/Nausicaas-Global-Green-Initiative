import { JSX } from "react"
import { Button } from "../button/Button"

interface FieldTypeSelectorProps {
  onSelect: (type: "text" | "radio" | "phone" | "email" | "currency") => void
  onCancel: () => void
}

export function FieldTypeSelector({
  onSelect,
  onCancel,
}: FieldTypeSelectorProps): JSX.Element {
  return (
    <div className="d-flex flex-column gap-3">
      <p className="text-muted mb-2">Select the type of field to add:</p>

      <button
        type="button"
        className="btn btn-outline-primary text-start p-3"
        onClick={() => onSelect("text")}
      >
        <div className="fw-semibold">Text Input Field</div>
        <small className="text-muted">
          Single or multi-line text with configurable max length
        </small>
      </button>

      <button
        type="button"
        className="btn btn-outline-primary text-start p-3"
        onClick={() => onSelect("radio")}
      >
        <div className="fw-semibold">Radio Button Field</div>
        <small className="text-muted">
          Multiple choice with configurable options
        </small>
      </button>

      <button
        type="button"
        className="btn btn-outline-primary text-start p-3"
        onClick={() => onSelect("phone")}
      >
        <div className="fw-semibold">Phone Number Field</div>
        <small className="text-muted">Validated phone number input</small>
      </button>

      <button
        type="button"
        className="btn btn-outline-primary text-start p-3"
        onClick={() => onSelect("email")}
      >
        <div className="fw-semibold">Email Field</div>
        <small className="text-muted">Validated email address input</small>
      </button>

      <button
        type="button"
        className="btn btn-outline-primary text-start p-3"
        onClick={() => onSelect("currency")}
      >
        <div className="fw-semibold">Funding Amount Field</div>
        <small className="text-muted">
          Euro amount with min/max range
        </small>
      </button>

      <hr />

      <Button variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  )
}

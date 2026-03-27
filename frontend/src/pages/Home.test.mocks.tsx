import type { Grant } from "../services/api/client"
import type { DynamicFieldConfig } from "../types"

export function MockExpandableGrantItem({
  grant,
  isExpanded,
  onToggle,
  onDelete,
  onEdit,
  isDeleting,
}: {
  grant: Grant
  isExpanded: boolean
  onToggle: () => void
  onDelete: (name: string) => void
  onEdit: (grant: Grant) => void
  isDeleting: boolean
}) {
  return (
    <li data-testid={`grant-item-${grant.name}`}>
      <span>{grant.name}</span>
      <span data-testid={`expanded-${grant.name}`}>
        {isExpanded ? "expanded" : "collapsed"}
      </span>
      <button onClick={onToggle}>Toggle {grant.name}</button>
      <button onClick={() => onDelete(grant.name)}>Delete {grant.name}</button>
      <button onClick={() => onEdit(grant)}>Edit {grant.name}</button>
      {isDeleting && <span>Deleting...</span>}
    </li>
  )
}

export function MockDynamicFieldModal({
  isOpen,
  onClose,
  onFieldAdd,
}: {
  isOpen: boolean
  onClose: () => void
  onFieldAdd: (config: DynamicFieldConfig) => void
}) {
  if (!isOpen) return null
  return (
    <div data-testid="field-modal">
      <button onClick={onClose}>Close Modal</button>
      <button
        onClick={() =>
          onFieldAdd({
            type: "text",
            label: "Custom Field",
            maxLength: 100,
            required: true,
          })
        }
      >
        Add Text Field
      </button>
    </div>
  )
}

export function MockDynamicFieldPreview({
  fields,
}: {
  fields: DynamicFieldConfig[]
}) {
  return (
    <div data-testid="field-preview">
      {fields.map((f, i) => (
        <span key={i}>{f.label}</span>
      ))}
    </div>
  )
}

export function MockDynamicFieldInput({
  field,
  index,
  value,
  onChange,
}: {
  field: DynamicFieldConfig
  index: number
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div data-testid={`dynamic-field-${index}`}>
      <label>{field.label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        data-testid={`dynamic-input-${index}`}
      />
    </div>
  )
}

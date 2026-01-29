# Adding a New Custom Field Type

This guide walks through adding a new custom field type to the grant creation system. We'll use a "number" field as an example.

## Overview

Custom fields are defined by:
- **Frontend types** - TypeScript interfaces for field configuration
- **Frontend components** - UI for configuring and rendering the field
- **Backend validation** - Optional server-side validation for the field value

## Files to Modify

| Location | File | Purpose |
|----------|------|---------|
| Frontend | `src/types/index.ts` | Add TypeScript interface |
| Frontend | `src/components/dynamicFields/DynamicFieldModal.tsx` | Add field type option |
| Frontend | `src/components/dynamicFields/DynamicFieldInput.tsx` | Render the input |
| Frontend | `src/components/dynamicFields/` | Add configurator component (if needed) |
| Backend | `src/api/grants/dto.py` | Add validation function (optional) |

---

## Step 1: Define the TypeScript Interface

**File:** `frontend/src/types/index.ts`

Add a new interface for your field configuration:

```typescript
// Existing types
export interface TextFieldConfig {
  type: "text"
  label: string
  maxLength: number
}

export interface RadioFieldConfig {
  type: "radio"
  label: string
  options: string[]
}

// ADD: New number field type
export interface NumberFieldConfig {
  type: "number"
  label: string
  min?: number
  max?: number
}

// Update the union type to include your new field
export type DynamicFieldConfig =
  | TextFieldConfig
  | RadioFieldConfig
  | PhoneFieldConfig
  | EmailFieldConfig
  | NumberFieldConfig  // ADD this
```

---

## Step 2: Add Field Type Option to Modal

**File:** `frontend/src/components/dynamicFields/DynamicFieldModal.tsx`

Add your new field type to the selection options:

```typescript
// Find the field type buttons section and add:
<button
  type="button"
  className="btn btn-outline-primary"
  onClick={() => setSelectedType("number")}
>
  Number
</button>
```

Add the configurator rendering:

```typescript
// In the render logic, add a case for your field type:
{selectedType === "number" && (
  <NumberFieldConfigurator
    onSubmit={handleFieldConfigured}
    onCancel={() => setSelectedType(null)}
  />
)}
```

---

## Step 3: Create a Configurator Component (if needed)

**File:** `frontend/src/components/dynamicFields/NumberFieldConfigurator.tsx`

For fields that need configuration options (like min/max for numbers):

```typescript
import { JSX, useState } from "react"
import { Button } from "../button/Button"
import type { NumberFieldConfig } from "../../types"

interface NumberFieldConfiguratorProps {
  onSubmit: (config: NumberFieldConfig) => void
  onCancel: () => void
}

export function NumberFieldConfigurator({
  onSubmit,
  onCancel,
}: NumberFieldConfiguratorProps): JSX.Element {
  const [label, setLabel] = useState("Number")
  const [min, setMin] = useState<number | undefined>(undefined)
  const [max, setMax] = useState<number | undefined>(undefined)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      type: "number",
      label,
      min,
      max,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Field Label</label>
        <input
          type="text"
          className="form-control"
          value={label}
          onChange={e => setLabel(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Minimum Value (optional)</label>
        <input
          type="number"
          className="form-control"
          value={min ?? ""}
          onChange={e => setMin(e.target.value ? Number(e.target.value) : undefined)}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Maximum Value (optional)</label>
        <input
          type="number"
          className="form-control"
          value={max ?? ""}
          onChange={e => setMax(e.target.value ? Number(e.target.value) : undefined)}
        />
      </div>
      <div className="d-flex gap-2">
        <Button type="submit" variant="primary">Add Field</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}
```

For simple fields (like phone/email that only need a label), use the existing `SimpleFieldConfigurator.tsx` component.

---

## Step 4: Render the Field Input

**File:** `frontend/src/components/dynamicFields/DynamicFieldInput.tsx`

Add rendering logic for your field type:

```typescript
// Add to the switch/case or conditional rendering:

if (config.type === "number") {
  const numberConfig = config as NumberFieldConfig
  return (
    <div className="mb-3">
      <label className="form-label">{config.label}</label>
      <input
        type="number"
        className="form-control"
        value={value}
        onChange={e => onChange(e.target.value)}
        min={numberConfig.min}
        max={numberConfig.max}
      />
      {error && <div className="text-danger small">{error}</div>}
    </div>
  )
}
```

---

## Step 5: Update Grant Display (Optional)

**File:** `frontend/src/components/grant/ExpandableGrantItem.tsx`

The expandable grant item already displays all custom fields generically, but if your field type needs special rendering (e.g., formatting), update the display logic:

```typescript
// In the custom fields mapping section:
{grant.custom_fields.configs.map((field, index) => (
  <div key={index} className="mb-2">
    <strong>{field.label}:</strong>
    <span className="ms-2">
      {/* Add special formatting for number fields if needed */}
      {field.type === "number"
        ? Number(grant.custom_fields?.values[`field_${index}`]).toLocaleString()
        : grant.custom_fields?.values[`field_${index}`] || "N/A"}
    </span>
  </div>
))}
```

---

## Step 6: Add Backend Validation (Optional)

**File:** `backend/src/nausicass_global_green_initiative_api/api/grants/dto.py`

If your field type needs server-side validation, add a validation function:

```python
def valid_number(value: str, min_val: int = None, max_val: int = None) -> str:
    """Validate number field."""
    try:
        num = float(value)
        if min_val is not None and num < min_val:
            raise ValueError(f"Value must be at least {min_val}")
        if max_val is not None and num > max_val:
            raise ValueError(f"Value must be at most {max_val}")
        return value
    except ValueError:
        raise ValueError(f"'{value}' is not a valid number")
```

Then call this validation in the grant creation/update handlers when processing custom fields.

---

## Step 7: Update the Client Types

**File:** `frontend/src/services/api/client.ts`

Update the `Grant` interface to include your new field type in the custom_fields configs:

```typescript
export interface Grant {
  // ... other fields
  custom_fields?: {
    configs: Array<
      | { type: "text"; label: string; maxLength: number }
      | { type: "radio"; label: string; options: string[] }
      | { type: "phone"; label: string }
      | { type: "email"; label: string }
      | { type: "number"; label: string; min?: number; max?: number }  // ADD
    >
    values: Record<string, string>
  }
}
```

---

## Testing

1. **Rebuild the frontend:**
   ```bash
   docker compose build --no-cache frontend && docker compose up -d
   ```

2. **Create a grant with the new field type** via the UI

3. **Verify the data is stored correctly:**
   ```bash
   docker compose exec db psql -U postgres -d nausicaa_dev -c 'SELECT name, jsonb_pretty(custom_fields::jsonb) FROM "grant";'
   ```

4. **Run frontend tests:**
   ```bash
   cd frontend && npm test
   ```

---

## Example: Complete File Changes for "Number" Field

### Summary of changes:
- `types/index.ts` - Add `NumberFieldConfig` interface
- `DynamicFieldModal.tsx` - Add "Number" button and configurator
- `NumberFieldConfigurator.tsx` - New file for configuration UI
- `DynamicFieldInput.tsx` - Add number input rendering
- `client.ts` - Update Grant interface

### JSON structure in database:
```json
{
  "configs": [
    {
      "type": "number",
      "label": "Budget Amount",
      "min": 0,
      "max": 1000000
    }
  ],
  "values": {
    "field_0": "50000"
  }
}
```

import { JSX } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { Button } from "../button/Button"
import { FormField } from "../form/FormField"
import type { RadioFieldConfig } from "../../types"

interface RadioFieldConfiguratorProps {
  onSubmit: (config: RadioFieldConfig) => void
  onCancel: () => void
}

interface FormData {
  label: string
  options: { value: string }[]
  required: boolean
}

export function RadioFieldConfigurator({
  onSubmit,
  onCancel,
}: RadioFieldConfiguratorProps): JSX.Element {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      label: "",
      options: [{ value: "" }, { value: "" }],
      required: false,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  })

  const handleFormSubmit = (data: FormData) => {
    const filteredOptions = data.options
      .map(o => o.value.trim())
      .filter(v => v !== "")

    if (filteredOptions.length < 2) {
      alert("Please provide at least 2 options")
      return
    }

    onSubmit({
      type: "radio",
      label: data.label,
      options: filteredOptions,
      required: data.required,
    })
  }

  return (
    <form
      onSubmit={event => {
        void handleSubmit(handleFormSubmit)(event)
      }}
    >
      <FormField label="Field Label" error={errors.label}>
        <input
          type="text"
          {...register("label", { required: "Label is required" })}
          className="form-control"
          placeholder="e.g., Project Category"
        />
      </FormField>

      <div className="mb-3">
        <label className="form-label">Options</label>
        {fields.map((field, index) => (
          <div key={field.id} className="d-flex gap-2 mb-2">
            <input
              type="text"
              {...register(`options.${index}.value` as const)}
              className="form-control"
              placeholder={`Option ${index + 1}`}
            />
            {fields.length > 2 && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => remove(index)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}

        {fields.length < 10 && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => append({ value: "" })}
          >
            + Add Option
          </Button>
        )}
      </div>

      <div className="form-check mb-3">
        <input
          type="checkbox"
          {...register("required")}
          className="form-check-input"
          id="radioFieldRequired"
        />
        <label className="form-check-label" htmlFor="radioFieldRequired">
          Required field
        </label>
      </div>

      <div className="d-flex gap-2 justify-content-end mt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Back
        </Button>
        <Button type="submit" variant="success">
          Add Field
        </Button>
      </div>
    </form>
  )
}

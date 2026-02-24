import { JSX } from "react"
import { useForm } from "react-hook-form"
import { Button } from "../button/Button"
import { FormField } from "../form/FormField"
import type { CurrencyFieldConfig } from "../../types"

interface CurrencyFieldConfiguratorProps {
  onSubmit: (config: CurrencyFieldConfig) => void
  onCancel: () => void
}

interface FormData {
  label: string
  min: number
  max: number
}

export function CurrencyFieldConfigurator({
  onSubmit,
  onCancel,
}: CurrencyFieldConfiguratorProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      label: "Funding Amount (€)",
      min: 0,
      max: 100000,
    },
  })

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      type: "currency",
      label: data.label,
      min: data.min,
      max: data.max,
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
          placeholder="e.g., Funding Amount (€)"
        />
      </FormField>

      <FormField label="Minimum Amount (€)" error={errors.min}>
        <input
          type="number"
          {...register("min", {
            valueAsNumber: true,
            min: { value: 0, message: "Minimum must be 0 or greater" },
          })}
          className="form-control"
          min={0}
          step="0.01"
        />
      </FormField>

      <FormField label="Maximum Amount (€)" error={errors.max}>
        <input
          type="number"
          {...register("max", {
            valueAsNumber: true,
            min: { value: 1, message: "Maximum must be at least 1" },
            validate: (value, formValues) =>
              value > formValues.min ||
              "Maximum must be greater than minimum",
          })}
          className="form-control"
          min={1}
          step="0.01"
        />
      </FormField>

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

import { JSX } from "react"
import { useForm } from "react-hook-form"
import { Button } from "../button/Button"
import { FormField } from "../form/FormField"
import type { TextFieldConfig } from "../../types"

interface TextFieldConfiguratorProps {
  onSubmit: (config: TextFieldConfig) => void
  onCancel: () => void
}

interface FormData {
  label: string
  maxLength: number
}

export function TextFieldConfigurator({
  onSubmit,
  onCancel,
}: TextFieldConfiguratorProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      label: "",
      maxLength: 500,
    },
  })

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      type: "text",
      label: data.label,
      maxLength: data.maxLength,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <FormField label="Field Label" error={errors.label}>
        <input
          type="text"
          {...register("label", { required: "Label is required" })}
          className="form-control"
          placeholder="e.g., Project Summary"
        />
      </FormField>

      <FormField label="Maximum Character Count" error={errors.maxLength}>
        <input
          type="number"
          {...register("maxLength", { valueAsNumber: true })}
          className="form-control"
          min={1}
          max={10000}
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

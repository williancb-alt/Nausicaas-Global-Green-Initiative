import { JSX } from "react"
import { useForm } from "react-hook-form"
import { Button } from "../button/Button"
import { FormField } from "../form/FormField"
import type { PhoneFieldConfig, EmailFieldConfig } from "../../types"

interface SimpleFieldConfiguratorProps {
  fieldType: "phone" | "email"
  onSubmit: (config: PhoneFieldConfig | EmailFieldConfig) => void
  onCancel: () => void
}

interface FormData {
  label: string
}

export function SimpleFieldConfigurator({
  fieldType,
  onSubmit,
  onCancel,
}: SimpleFieldConfiguratorProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      label: fieldType === "phone" ? "Phone Number" : "Email Address",
    },
  })

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      type: fieldType,
      label: data.label,
    } as PhoneFieldConfig | EmailFieldConfig)
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
          placeholder={
            fieldType === "phone"
              ? "e.g., Contact Phone"
              : "e.g., Contact Email"
          }
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

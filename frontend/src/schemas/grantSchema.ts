import { z } from "zod"

// Phone number regex - supports various formats
export const phoneRegex =
  /^[+]?[0-9]{0,3}[-\s]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/

// Email regex
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const createGrantSchema = z.object({
  name: z
    .string()
    .min(1, "Grant name is required")
    .regex(
      /^[\w\s-]+$/,
      "Grant name can only contain letters, numbers, spaces, hyphens, and underscores",
    ),
  deadline: z.string().min(1, "Deadline is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description must be 1000 characters or less"),
})

export type CreateGrantFormData = z.infer<typeof createGrantSchema>

// Schema for text field configuration
export const textFieldConfigSchema = z.object({
  type: z.literal("text"),
  label: z.string().min(1, "Field label is required").max(50),
  maxLength: z.number().min(1).max(10000).default(500),
})

// Schema for radio field configuration
export const radioFieldConfigSchema = z.object({
  type: z.literal("radio"),
  label: z.string().min(1, "Field label is required").max(50),
  options: z
    .array(z.string().min(1, "Option label is required"))
    .min(2, "Radio fields must have at least 2 options")
    .max(10, "Radio fields can have at most 10 options"),
})

// Schema for currency field configuration
export const currencyFieldConfigSchema = z.object({
  type: z.literal("currency"),
  label: z.string().min(1, "Field label is required").max(50),
  min: z.number().min(0, "Minimum must be 0 or greater"),
  max: z.number().min(1, "Maximum must be at least 1"),
})

export type TextFieldConfigFormData = z.infer<typeof textFieldConfigSchema>
export type RadioFieldConfigFormData = z.infer<typeof radioFieldConfigSchema>
export type CurrencyFieldConfigFormData = z.infer<
  typeof currencyFieldConfigSchema
>

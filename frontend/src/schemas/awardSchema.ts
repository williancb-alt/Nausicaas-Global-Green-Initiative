import { z } from "zod"

// Phone number regex - supports various formats
export const phoneRegex =
  /^[+]?[0-9]{0,3}[-\s]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/

// Email regex
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const createAwardSchema = z.object({
  name: z
    .string()
    .min(1, "Award name is required")
    .regex(
      /^[\w\s-]+$/,
      "Award name can only contain letters, numbers, spaces, hyphens, and underscores",
    ),
  deadline: z.string().min(1, "Deadline is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description must be 1000 characters or less"),
})

export type CreateAwardFormData = z.infer<typeof createAwardSchema>

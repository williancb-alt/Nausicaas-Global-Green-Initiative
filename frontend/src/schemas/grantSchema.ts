import { z } from "zod"

export const createGrantSchema = z.object({
  name: z
    .string()
    .min(1, "Grant name is required")
    .regex(
      /^[\w\s-]+$/,
      "Grant name can only contain letters, numbers, spaces, hyphens, and underscores",
    ),
  deadline: z.string().min(1, "Deadline is required"),
})

export type CreateGrantFormData = z.infer<typeof createGrantSchema>

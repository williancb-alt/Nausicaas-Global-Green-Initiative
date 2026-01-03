import { z } from "zod"

export const loginSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z.string().min(4, "Password must be at least 4 characters"),
})

export type LoginFormData = z.infer<typeof loginSchema>

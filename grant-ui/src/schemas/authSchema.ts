import { z } from "zod"

export const loginSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z.string().min(4, "Password must be at least 4 characters"),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const signupSchema = z
  .object({
    email: z.email({ error: "Invalid email address" }),
    password: z.string().min(4, "Password must be at least 4 characters"),
    confirmPassword: z
      .string()
      .min(4, "Password must be at least 4 characters"),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type SignupFormData = z.infer<typeof signupSchema>

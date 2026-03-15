import { z } from "zod"

const passwordRequiredMessage =
  "Password required. It must contain a minimum of 8 characters, 1 capital letter and 1 number"

const passwordSchema = z
  .string()
  .min(8, passwordRequiredMessage)
  .regex(/[A-Z]/, passwordRequiredMessage)
  .regex(/[0-9]/, passwordRequiredMessage)

export const loginSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z.string().min(1, "Password is required"),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const signupSchema = z
  .object({
    email: z.email({ error: "Invalid email address" }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type SignupFormData = z.infer<typeof signupSchema>

export const forgotPasswordSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

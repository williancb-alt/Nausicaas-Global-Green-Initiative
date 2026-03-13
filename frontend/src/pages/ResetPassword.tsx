import React, { type JSX } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useSearchParams } from "react-router-dom"
import { Button } from "../components/button/Button"
import { useResetPassword } from "../hooks/useAuthHooks"
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "../schemas/authSchema"
import { FormField } from "../components/form/FormField"
import { PasswordInput } from "../components/form/PasswordInput"
import { AlertError } from "../components/alert/AlertError"
import { PasswordRequirements } from "../components/form/PasswordRequirements"
import { BUTTON_TEXT } from "../utils/constants"

export function ResetPassword(): JSX.Element {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const resetPasswordMutation = useResetPassword()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const passwordValue = watch("password", "")

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) return
    resetPasswordMutation.mutate({ token, password: data.password })
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void handleSubmit(onSubmit)(e)
  }

  if (!token) {
    return (
      <div
        className="container py-5 d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: "calc(100vh - 104px)" }}
      >
        <div
          className="card shadow-sm"
          style={{ width: "100%", maxWidth: "400px" }}
        >
          <div className="card-body p-4">
            <p className="mb-3">Invalid or missing reset link.</p>
            <Link
              to="/forgot-password"
              className="text-decoration-underline"
              style={{ color: "var(--text-primary)" }}
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (resetPasswordMutation.isSuccess) {
    return (
      <div
        className="container py-5 d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: "calc(100vh - 104px)" }}
      >
        <div
          className="card shadow-sm"
          style={{ width: "100%", maxWidth: "400px" }}
        >
          <div className="card-body p-4">
            <p className="mb-3">Your password has been reset successfully.</p>
            <Link
              to="/login"
              className="text-decoration-underline"
              style={{ color: "var(--text-primary)" }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="container py-5 d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: "calc(100vh - 104px)" }}
    >
      <div
        className="card shadow-sm"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <div className="card-body p-4">
          <form onSubmit={handleFormSubmit}>
            <p className="mb-3">Enter your new password.</p>
            <FormField label="New Password" error={errors.password}>
              <PasswordInput
                registration={register("password")}
                placeholder="Enter your new password"
              />
              <PasswordRequirements password={passwordValue} />
            </FormField>
            <FormField label="Confirm Password" error={errors.confirmPassword}>
              <PasswordInput
                registration={register("confirmPassword")}
                placeholder="Confirm your new password"
              />
            </FormField>
            {resetPasswordMutation.isError && (
              <AlertError
                error={resetPasswordMutation.error}
                fallback="Failed to reset password"
              />
            )}
            <Button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              variant="primary"
              className="mt-2 p-2 w-100 rounded"
            >
              {resetPasswordMutation.isPending
                ? BUTTON_TEXT.RESETTING_PASSWORD
                : BUTTON_TEXT.RESET_PASSWORD}
            </Button>
            <div className="mt-3">
              <Link
                to="/login"
                className="text-decoration-underline"
                style={{ color: "var(--text-primary)" }}
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

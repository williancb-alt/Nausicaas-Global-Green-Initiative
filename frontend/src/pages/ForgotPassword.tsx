import React, { useState, type JSX } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router-dom"
import { Button } from "../components/button/Button"
import { useForgotPassword } from "../hooks/useAuthHooks"
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "../schemas/authSchema"
import { FormField } from "../components/form/FormField"
import { AlertError } from "../components/alert/AlertError"
import { BUTTON_TEXT } from "../utils/constants"

export function ForgotPassword(): JSX.Element {
  const forgotPasswordMutation = useForgotPassword()
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data.email, {
      onSuccess: () => setSubmitted(true),
    })
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void handleSubmit(onSubmit)(e)
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
          {submitted ? (
            <div>
              <p className="mb-3">
                If that email is registered, a reset link has been sent. Please
                check your inbox.
              </p>
              <Link
                to="/login"
                className="text-decoration-underline"
                style={{ color: "var(--text-primary)" }}
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit}>
              <p className="mb-3">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
              <FormField label="Email" error={errors.email}>
                <input
                  type="email"
                  {...register("email")}
                  className="form-control"
                  autoComplete="email"
                  aria-required="true"
                  placeholder="Enter your email"
                />
              </FormField>
              {forgotPasswordMutation.isError && (
                <AlertError
                  error={forgotPasswordMutation.error}
                  fallback="Failed to send reset link"
                />
              )}
              <Button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                variant="primary"
                className="mt-2 p-2 w-100 rounded"
              >
                {forgotPasswordMutation.isPending
                  ? BUTTON_TEXT.SENDING_RESET_LINK
                  : BUTTON_TEXT.SEND_RESET_LINK}
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
          )}
        </div>
      </div>
    </div>
  )
}

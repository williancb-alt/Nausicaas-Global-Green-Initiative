import React, { useState } from "react"
import { JSX } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, Navigate, Link } from "react-router-dom"
import { Button } from "../components/button/Button"
import { useRegister } from "../hooks/useAuthHooks"
import { useAuthStore } from "../store/authStore"
import { signupSchema, type SignupFormData } from "../schemas/authSchema"
import { FormField } from "../components/form/FormField"
import { AlertError } from "../components/alert/AlertError"
import { BUTTON_TEXT } from "../utils/constants"
import { OAuthButtons } from "../features/oauth/OAuthButtons"

export function Signup(): JSX.Element {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const registerMutation = useRegister()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSignup = (data: SignupFormData) => {
    registerMutation.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: () => {
          reset()
          void navigate("/")
        },
      },
    )
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void handleSubmit(onSignup)(e)
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
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
            <FormField label="Password" error={errors.password}>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="form-control"
                  autoComplete="new-password"
                  aria-required="true"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </FormField>
            <FormField label="Confirm Password" error={errors.confirmPassword}>
              <div className="input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className="form-control"
                  autoComplete="new-password"
                  aria-required="true"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </FormField>
            {registerMutation.isError && (
              <AlertError
                error={registerMutation.error}
                fallback="Signup failed"
              />
            )}
            <Button
              type="submit"
              disabled={registerMutation.isPending}
              variant="primary"
              className="mt-2 p-2 w-100 rounded"
            >
              {registerMutation.isPending
                ? BUTTON_TEXT.SIGNING_UP
                : BUTTON_TEXT.SIGN_UP}
            </Button>
            <div className="mt-3">
              <Link
                to="/login"
                className="text-decoration-underline"
                style={{ color: "var(--text-primary)" }}
              >
                Already have an account? Sign In
              </Link>
            </div>
          </form>
          <OAuthButtons variant="signup" />
        </div>
      </div>
    </div>
  )
}

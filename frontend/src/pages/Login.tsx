import React, { type JSX } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, Navigate, Link, useLocation } from "react-router-dom"
import { Button } from "../components/button/Button"
import { useLogin } from "../hooks/useAuthHooks"
import { useAuthStore } from "../store/authStore"
import { loginSchema, type LoginFormData } from "../schemas/authSchema"
import { FormField } from "../components/form/FormField"
import { AlertError } from "../components/alert/AlertError"
import { BUTTON_TEXT } from "../utils/constants"

type AuthUserLike = { admin?: boolean } | null

function getPostLoginRedirectPath(user: AuthUserLike, from?: string): string {
  if (user?.admin) return "/admin"
  if (from) return from
  return "/"
}

export function Login(): JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()
  const loginMutation = useLogin()

  const from = (location.state as { from?: string } | null)?.from

  const handleFormSubmit: React.ChangeEventHandler<HTMLFormElement> = event => {
    void handleSubmit(onLogin)(event)
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onLogin = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        reset()
        const user = useAuthStore.getState().user
        const path = getPostLoginRedirectPath(user, from)
        void navigate(path, { replace: true })
      },
    })
  }

  if (isAuthenticated) {
    const user = useAuthStore.getState().user
    const path = getPostLoginRedirectPath(user, from)
    return <Navigate to={path} replace />
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
              <input
                type="password"
                {...register("password")}
                className="form-control"
                autoComplete="current-password"
                aria-required="true"
                placeholder="Enter your password"
              />
            </FormField>
            {loginMutation.isError && (
              <AlertError error={loginMutation.error} fallback="Login failed" />
            )}
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              variant="primary"
              className="mt-2 p-2 w-100 rounded"
            >
              {loginMutation.isPending
                ? BUTTON_TEXT.LOGGING_IN
                : BUTTON_TEXT.LOGIN}
            </Button>
            <div className="mt-3">
              <Link
                to="/forgot-password"
                className="text-decoration-underline"
                style={{ color: "var(--text-primary)" }}
              >
                Forgot password?
              </Link>
            </div>
          </form>

          <Button
            type="button"
            variant="secondary"
            className="mt-3 p-2 w-100 rounded"
            onClick={() => {
              const base = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")
              window.location.href = `${base}/api/v1/auth/oauth/google`
            }}
          >
            Continue with Google
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="mt-2 p-2 w-100 rounded"
            onClick={() => {
              const base = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")
              window.location.href = `${base}/api/v1/auth/oauth/github`
            }}
          >
            Continue with GitHub
          </Button>
        </div>
      </div>
      <Link
        to="/signup"
        className="mt-4 text-end text-decoration-underline"
        style={{
          width: "100%",
          maxWidth: "400px",
          color: "var(--text-primary)",
        }}
      >
        Don't have an account? Sign Up
      </Link>
    </div>
  )
}

import React from "react"
import { JSX } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, Navigate, Link, /*useLocation*/ } from "react-router-dom"
import { Button } from "../components/button/Button"
import { useLogin } from "../hooks/useAuthHooks"
import { useAuthStore } from "../store/authStore"
import { loginSchema, type LoginFormData } from "../schemas/authSchema"
import { FormField } from "../components/form/FormField"
import { AlertError } from "../components/alert/AlertError"
import { BUTTON_TEXT } from "../utils/constants"

export function Login(): JSX.Element {
  const navigate = useNavigate()
  //  const location = useLocation()
  const { isAuthenticated } = useAuthStore()
  const loginMutation = useLogin()

  // Get redirect destination from location state (set when redirecting from Apply button)
  // const from = (location.state as { from?: string })?.from

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
        // If there's a redirect destination and user is not admin, go there
        // Admins always go to admin dashboard, regular users go to 'from' or home
        if (user?.admin) {
          navigate("/admin", { replace: true })
        } else {
          navigate("/applications", { replace: true })
        }
      },
    })
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void handleSubmit(onLogin)(e)
  }

  if (isAuthenticated) {
    const user = useAuthStore.getState().user
    if (user?.admin) {
      return <Navigate to="/admin" replace />
    }
    return <Navigate to="/applications" replace />
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

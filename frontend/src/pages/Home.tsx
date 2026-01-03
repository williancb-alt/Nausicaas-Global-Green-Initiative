import React from "react"
import { JSX } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "../components/button/Button"
import { useAuthStore } from "../store/authStore"
import { useGrantsStore } from "../store/grantsStore"
import { useLogin, useLogout, useUser } from "../hooks/useAuthHooks"
import { useGrants, useCreateGrant } from "../hooks/useGrantHooks"
import { loginSchema, type LoginFormData } from "../schemas/authSchema"
import {
  createGrantSchema,
  type CreateGrantFormData,
} from "../schemas/grantSchema"
import { FormField } from "../components/form/FormField"
import { AlertError } from "../components/alert/AlertError"
import { BUTTON_TEXT, MESSAGES } from "../utils/constants"

export function Home(): JSX.Element {
  const { isAuthenticated, user } = useAuthStore()
  const { currentPage, setCurrentPage } = useGrantsStore()
  const queryClient = useQueryClient()

  const loginMutation = useLogin()
  const logoutMutation = useLogout()
  const createGrantMutation = useCreateGrant()
  const { data: userData } = useUser()
  const {
    data: grantsData,
    isLoading: grantsLoading,
    refetch: refetchGrants,
  } = useGrants()

  const currentUser = userData ?? user

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLoginForm,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const {
    register: registerGrant,
    handleSubmit: handleGrantSubmit,
    formState: { errors: grantErrors },
    reset: resetGrantForm,
  } = useForm<CreateGrantFormData>({
    resolver: zodResolver(createGrantSchema),
  })

  const onLogin = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        resetLoginForm()
      },
    })
  }

  const onLogout = () => {
    logoutMutation.mutate()
  }

  const onCreateGrant = (data: CreateGrantFormData) => {
    createGrantMutation.mutate(data, {
      onSuccess: () => {
        resetGrantForm()
        queryClient
          .invalidateQueries({ queryKey: ["grants"] })
          // TODO - improve error handling
          .catch(console.error)
        setCurrentPage(1)
      },
    })
  }

  const handleLoginFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void handleLoginSubmit(onLogin)(e)
  }

  const handleGrantFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void handleGrantSubmit(onCreateGrant)(e)
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Grants Test UI</h1>

      {isAuthenticated && currentUser && (
        <div className="alert alert-success mb-4">
          Logged in as: {currentUser.email} {currentUser.admin && "(Admin)"}
          <Button
            onClick={onLogout}
            disabled={logoutMutation.isPending}
            variant="danger"
            className="ms-2"
          >
            {logoutMutation.isPending
              ? BUTTON_TEXT.LOGGING_OUT
              : BUTTON_TEXT.LOGOUT}
          </Button>
        </div>
      )}

      {!isAuthenticated && (
        <div className="card mb-4">
          <div className="card-body">
            <h2 className="h5 card-title">1) Login (get token)</h2>
            <form onSubmit={handleLoginFormSubmit} className="mt-3">
              <FormField label="Email" error={loginErrors.email}>
                <input
                  type="email"
                  {...registerLogin("email")}
                  className="form-control"
                  autoComplete="email"
                  aria-required="true"
                />
              </FormField>
              <FormField label="Password" error={loginErrors.password}>
                <input
                  type="password"
                  {...registerLogin("password")}
                  className="form-control"
                  autoComplete="current-password"
                  aria-required="true"
                />
              </FormField>
              {loginMutation.isError && (
                <AlertError
                  error={loginMutation.error}
                  fallback="Login failed"
                />
              )}
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                variant="primary"
              >
                {loginMutation.isPending
                  ? BUTTON_TEXT.LOGGING_IN
                  : BUTTON_TEXT.LOGIN}
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="h5 card-title">2) Create Grant</h2>
          <form onSubmit={handleGrantFormSubmit} className="mt-3">
            <FormField label="Grant Name" error={grantErrors.name}>
              <input
                type="text"
                {...registerGrant("name")}
                className="form-control"
                aria-required="true"
              />
            </FormField>
            <FormField
              label="Deadline (DD/MM/YYYY)"
              error={grantErrors.deadline}
            >
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                {...registerGrant("deadline")}
                className="form-control"
                aria-required="true"
              />
            </FormField>
            {createGrantMutation.isError && (
              <AlertError
                error={createGrantMutation.error}
                fallback="Create grant failed"
              />
            )}
            <Button
              type="submit"
              disabled={createGrantMutation.isPending || !isAuthenticated}
              variant="success"
            >
              {createGrantMutation.isPending
                ? BUTTON_TEXT.CREATING
                : BUTTON_TEXT.CREATE_GRANT}
            </Button>
            {!isAuthenticated && (
              <div className="alert alert-warning mt-3 mb-0">
                Please log in first to create grants.
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center gap-3 mb-3">
            <h2 className="h5 card-title mb-0">3) List Grants</h2>
            <Button
              onClick={() => {
                void refetchGrants()
              }}
              disabled={grantsLoading || !isAuthenticated}
              variant="info"
            >
              {grantsLoading ? BUTTON_TEXT.LOADING : BUTTON_TEXT.REFRESH}
            </Button>
          </div>

          {!isAuthenticated && (
            <div className="alert alert-warning mb-3">
              Please log in first to view grants.
            </div>
          )}

          {grantsLoading ? (
            <p className="text-muted">{MESSAGES.LOADING_GRANTS}</p>
          ) : grantsData?.items && grantsData.items.length > 0 ? (
            <>
              <ul className="list-group">
                {grantsData.items.map(g => (
                  <li key={g.name} className="list-group-item">
                    <div className="fw-semibold">{g.name}</div>
                    {g.deadline && (
                      <div className="text-muted small">
                        Deadline: {g.deadline}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-muted small">
                Page {currentPage} of {grantsData.total_pages} (
                {grantsData.total_items} total grants)
              </div>
            </>
          ) : isAuthenticated ? (
            <p className="text-muted mb-0">{MESSAGES.NO_GRANTS_LOADED}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

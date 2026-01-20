import React from "react"
import { JSX } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "../components/button/Button"
import { useAuthStore } from "../store/authStore"
import { useGrantsStore } from "../store/grantsStore"
import { useGrants, useCreateGrant } from "../hooks/useGrantHooks"
import {
  createGrantSchema,
  type CreateGrantFormData,
} from "../schemas/grantSchema"
import { FormField } from "../components/form/FormField"
import { AlertError } from "../components/alert/AlertError"
import { BUTTON_TEXT, MESSAGES } from "../utils/constants"

export function Home(): JSX.Element {
  const { isAuthenticated } = useAuthStore()
  const { currentPage, setCurrentPage } = useGrantsStore()
  const queryClient = useQueryClient()

  const createGrantMutation = useCreateGrant()
  const {
    data: grantsData,
    isLoading: grantsLoading,
    refetch: refetchGrants,
  } = useGrants()

  const {
    register: registerGrant,
    handleSubmit: handleGrantSubmit,
    formState: { errors: grantErrors },
    reset: resetGrantForm,
  } = useForm<CreateGrantFormData>({
    resolver: zodResolver(createGrantSchema),
  })

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

  const handleGrantFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void handleGrantSubmit(onCreateGrant)(e)
  }

  return (
    <div className="container py-4">
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="h5 card-title">Create Grant</h2>
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
          </form>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center gap-3 mb-3">
            <h2 className="h5 card-title mb-0">List Grants</h2>
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
          ) : (
            <p className="text-muted mb-0">{MESSAGES.NO_GRANTS_LOADED}</p>
          )}
        </div>
      </div>
    </div>
  )
}

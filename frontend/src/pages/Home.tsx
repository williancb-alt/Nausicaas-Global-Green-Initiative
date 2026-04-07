import React, { useState } from "react"
import { JSX } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "../components/button/Button"
import { useAuthStore } from "../store/authStore"
import { getMonitoring } from "../services/monitoring"
import { useGrantsStore } from "../store/grantsStore"
import {
  useGrants,
  useCreateGrant,
  useDeleteGrant,
} from "../hooks/useGrantHooks"
import {
  createGrantSchema,
  type CreateGrantFormData,
} from "../schemas/grantSchema"
import { FormField } from "../components/form/FormField"
import { AlertError } from "../components/alert/AlertError"
import { DynamicFieldModal } from "../components/dynamicFields/DynamicFieldModal"
import { DynamicFieldPreview } from "../components/dynamicFields/DynamicFieldPreview"
import { DynamicFieldInput } from "../components/dynamicFields/DynamicFieldInput"
import { ExpandableGrantItem } from "../components/grant/ExpandableGrantItem"
import { BUTTON_TEXT, MESSAGES } from "../utils/constants"
import type { DynamicFieldConfig } from "../types"
import type { Grant } from "../services/api/client"

export function Home(): JSX.Element {
  const { isAuthenticated } = useAuthStore()
  const { currentPage, setCurrentPage } = useGrantsStore()
  const queryClient = useQueryClient()

  // Dynamic field state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dynamicFieldConfigs, setDynamicFieldConfigs] = useState<
    DynamicFieldConfig[]
  >([])
  const [dynamicFieldValues, setDynamicFieldValues] = useState<
    Record<string, string>
  >({})

  // Expanded grants state
  const [expandedGrants, setExpandedGrants] = useState<Set<string>>(new Set())

  // Track which grant is being deleted
  const [deletingGrant, setDeletingGrant] = useState<string | null>(null)

  const createGrantMutation = useCreateGrant()
  const deleteGrantMutation = useDeleteGrant()
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
    // Build custom_fields JSON if there are dynamic fields
    let customFieldsJson: string | undefined
    if (dynamicFieldConfigs.length > 0) {
      customFieldsJson = JSON.stringify({
        configs: dynamicFieldConfigs,
        values: dynamicFieldValues,
      })
    }

    const params: {
      name: string
      deadline: string
      description: string
      custom_fields?: string
    } = {
      name: data.name,
      deadline: data.deadline,
      description: data.description,
    }
    if (customFieldsJson) {
      params.custom_fields = customFieldsJson
    }

    createGrantMutation.mutate(params, {
      onSuccess: () => {
        resetGrantForm()
        setDynamicFieldConfigs([])
        setDynamicFieldValues({})
        queryClient
          .invalidateQueries({ queryKey: ["grants"] })
          .catch((err: unknown) => getMonitoring().captureException(err))
        setCurrentPage(1)
      },
    })
  }

  const handleGrantFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void handleGrantSubmit(onCreateGrant)(e)
  }

  const handleFieldAdd = (config: DynamicFieldConfig) => {
    setDynamicFieldConfigs(prev => [...prev, config])
  }

  const handleRemoveLastField = () => {
    if (dynamicFieldConfigs.length > 0) {
      const lastIndex = dynamicFieldConfigs.length - 1
      setDynamicFieldConfigs(prev => prev.slice(0, -1))
      setDynamicFieldValues(prev => {
        const newValues = { ...prev }
        delete newValues[`field_${lastIndex}`]
        return newValues
      })
    }
  }

  const handleDynamicFieldChange = (index: number, value: string) => {
    setDynamicFieldValues(prev => ({
      ...prev,
      [`field_${index}`]: value,
    }))
  }

  const toggleGrantExpanded = (name: string) => {
    setExpandedGrants(prev => {
      const newSet = new Set(prev)
      if (newSet.has(name)) {
        newSet.delete(name)
      } else {
        newSet.add(name)
      }
      return newSet
    })
  }

  const handleDeleteGrant = (name: string) => {
    setDeletingGrant(name)
    deleteGrantMutation.mutate(name, {
      onSuccess: () => {
        queryClient
          .invalidateQueries({ queryKey: ["grants"] })
          .catch((err: unknown) => getMonitoring().captureException(err))
        setDeletingGrant(null)
      },
      onError: () => {
        setDeletingGrant(null)
      },
    })
  }

  const handleEditGrant = (grant: Grant) => {
    // For now, just show an alert - could be expanded to a modal later
    alert(
      `Edit functionality for "${grant.name}" - This could open an edit modal or navigate to an edit page.`,
    )
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

            <FormField label="Description" error={grantErrors.description}>
              <textarea
                {...registerGrant("description")}
                className="form-control"
                rows={3}
                aria-required="true"
              />
            </FormField>

            <hr />

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Custom Fields</h6>
              <div className="d-flex gap-2">
                <Button
                  type="button"
                  variant="success"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                >
                  + Add Field
                </Button>
                {dynamicFieldConfigs.length > 0 && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={handleRemoveLastField}
                  >
                    - Remove Last
                  </Button>
                )}
              </div>
            </div>

            <DynamicFieldPreview fields={dynamicFieldConfigs} />

            {dynamicFieldConfigs.map((field, index) => (
              <DynamicFieldInput
                key={index}
                field={field}
                index={index}
                value={dynamicFieldValues[`field_${index}`] || ""}
                onChange={value => handleDynamicFieldChange(index, value)}
              />
            ))}

            <hr />

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

          {deleteGrantMutation.isError && (
            <AlertError
              error={deleteGrantMutation.error}
              fallback="Delete grant failed"
            />
          )}

          {grantsLoading ? (
            <p className="text-muted">{MESSAGES.LOADING_GRANTS}</p>
          ) : grantsData?.items && grantsData.items.length > 0 ? (
            <>
              <ul className="list-group">
                {grantsData.items.map(g => (
                  <ExpandableGrantItem
                    key={g.name}
                    grant={g}
                    isExpanded={expandedGrants.has(g.name)}
                    onToggle={() => toggleGrantExpanded(g.name)}
                    onDelete={handleDeleteGrant}
                    onEdit={handleEditGrant}
                    isDeleting={deletingGrant === g.name}
                  />
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

      <DynamicFieldModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFieldAdd={handleFieldAdd}
      />
    </div>
  )
}

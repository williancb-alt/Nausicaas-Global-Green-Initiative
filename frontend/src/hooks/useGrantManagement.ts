import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  useGrants,
  useCreateGrant,
  useUpdateGrant,
  useDeleteGrant,
} from "../hooks/useGrantHooks"
import { useGrantsStore } from "../store/grantsStore"
import {
  createGrantSchema,
  type CreateGrantFormData,
} from "../schemas/grantSchema"
import type { DynamicFieldConfig, UpdateGrantParams } from "../types"
import type { Grant } from "../services/api/client"
import { GRANT_MESSAGES } from "../utils/constants"
import { GrantEditField } from "../components/grant/management/types"

export function useGrantManagement() {
  const { data: grantsData, isLoading } = useGrants()
  const createGrant = useCreateGrant()
  const updateGrant = useUpdateGrant()
  const deleteGrant = useDeleteGrant()
  const { setCurrentPage } = useGrantsStore()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: "",
    deadline: "",
    description: "",
  })
  const [togglingGrant, setTogglingGrant] = useState<string | null>(null)
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false)

  // Dynamic fields state
  const [customFieldConfigs, setCustomFieldConfigs] = useState<
    DynamicFieldConfig[]
  >([])
  const [customFieldValues, setCustomFieldValues] = useState<
    Record<string, string>
  >({})

  const [editCustomFieldConfigs, setEditCustomFieldConfigs] = useState<
    DynamicFieldConfig[]
  >([])
  const [editCustomFieldValues, setEditCustomFieldValues] = useState<
    Record<string, string>
  >({})

  const form = useForm<CreateGrantFormData>({
    resolver: zodResolver(createGrantSchema),
  })

  const onCreate = (data: CreateGrantFormData) => {
    const payload = {
      ...data,
      custom_fields: JSON.stringify({
        configs: customFieldConfigs,
        values: customFieldValues,
      }),
    }

    createGrant.mutate(payload, {
      onSuccess: () => {
        form.reset()
        setCustomFieldConfigs([])
        setCustomFieldValues({})
        setCurrentPage(1)
      },
    })
  }

  const startEdit = (grant: Grant) => {
    setEditingId(grant.name)
    setEditFormData({
      name: grant.name,
      deadline: grant.deadline || "",
      description: grant.description || "",
    })

    try {
      if (grant.custom_fields) {
        const parsed =
          typeof grant.custom_fields === "string"
            ? (JSON.parse(grant.custom_fields) as {
                configs?: DynamicFieldConfig[]
                values?: Record<string, string>
              })
            : grant.custom_fields
        setEditCustomFieldConfigs(parsed.configs ?? [])
        setEditCustomFieldValues(parsed.values ?? {})
      } else {
        setEditCustomFieldConfigs([])
        setEditCustomFieldValues({})
      }
    } catch {
      setEditCustomFieldConfigs([])
      setEditCustomFieldValues({})
    }
  }

  const handleEditChange = (field: GrantEditField, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }))
  }

  const saveEdit = () => {
    if (!editingId) return
    const payload: UpdateGrantParams = {
      name: editingId,
    }

    if (editFormData.deadline) payload.deadline = editFormData.deadline
    if (editFormData.description) payload.description = editFormData.description

    payload.custom_fields = JSON.stringify({
      configs: editCustomFieldConfigs,
      values: editCustomFieldValues,
    })

    updateGrant.mutate(payload, {
      onSuccess: () => {
        setEditingId(null)
      },
      onError: error => {
        alert(GRANT_MESSAGES.saveError(error.message))
      },
    })
  }

  const onDelete = (name: string) => {
    if (!window.confirm(GRANT_MESSAGES.deleteConfirm(name))) {
      return
    }
    deleteGrant.mutate(name)
  }

  const toggleVisibility = (grant: Grant) => {
    const newHiddenState = !grant.hidden
    setTogglingGrant(grant.name)
    updateGrant.mutate(
      {
        name: grant.name,
        hidden: newHiddenState,
      },
      {
        onSuccess: () => {
          setTogglingGrant(null)
        },
        onError: error => {
          alert(GRANT_MESSAGES.toggleError(error.message))
          setTogglingGrant(null)
        },
      },
    )
  }

  const handleFieldAdd = (config: DynamicFieldConfig) => {
    if (editingId) {
      setEditCustomFieldConfigs(prev => [...prev, config])
    } else {
      setCustomFieldConfigs(prev => [...prev, config])
    }
  }

  const handleRemoveField = (index: number, forEdit = false) => {
    if (forEdit) {
      setEditCustomFieldConfigs(prev => prev.filter((_, i) => i !== index))
      setEditCustomFieldValues(prev => {
        const next = { ...prev }
        const key = editCustomFieldConfigs[index]?.label
        if (key) delete next[key]
        return next
      })
    } else {
      setCustomFieldConfigs(prev => prev.filter((_, i) => i !== index))
      setCustomFieldValues(prev => {
        const next = { ...prev }
        const key = customFieldConfigs[index]?.label
        if (key) delete next[key]
        return next
      })
    }
  }

  const setFieldValue = (label: string, value: string, forEdit = false) => {
    if (forEdit) {
      setEditCustomFieldValues(prev => ({ ...prev, [label]: value }))
    } else {
      setCustomFieldValues(prev => ({ ...prev, [label]: value }))
    }
  }

  return {
    grants: grantsData?.items ?? [],
    isLoading,
    form,
    onCreate,
    editingId,
    setEditingId,
    editFormData,
    startEdit,
    handleEditChange,
    saveEdit,
    isSaving: updateGrant.isPending,
    onDelete,
    toggleVisibility,
    togglingGrant,
    customFieldConfigs,
    customFieldValues,
    editCustomFieldConfigs,
    editCustomFieldValues,
    handleFieldAdd,
    handleRemoveField,
    setFieldValue,
    isFieldModalOpen,
    setIsFieldModalOpen,
  }
}

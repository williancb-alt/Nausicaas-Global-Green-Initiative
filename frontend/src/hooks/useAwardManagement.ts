import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  useAwards,
  useCreateAward,
  useUpdateAward,
  useDeleteAward,
} from "../hooks/useAwardHooks"
import { useAwardsStore } from "../store/awardsStore"
import {
  createAwardSchema,
  type CreateAwardFormData,
} from "../schemas/awardSchema"
import type { Award } from "../services/api/client"
import { AWARD_MESSAGES } from "../utils/constants"
import {
  AwardEditField,
  EditFormData,
} from "../components/award/management/types"
import type { UpdateAwardParams } from "../types"

export function useAwardManagement() {
  const { data: awardsData, isLoading } = useAwards()
  const createAward = useCreateAward()
  const updateAward = useUpdateAward()
  const deleteAward = useDeleteAward()
  const { setCurrentPage } = useAwardsStore()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: "",
    deadline: "",
    description: "",
  })
  const [togglingAward, setTogglingAward] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAwardFormData>({
    resolver: zodResolver(createAwardSchema),
  })

  const onCreate = (data: CreateAwardFormData) => {
    createAward.mutate(data, {
      onSuccess: () => {
        reset()
        setCurrentPage(1)
      },
    })
  }

  const startEdit = (award: Award) => {
    setEditingId(award.name)
    setEditFormData({
      name: award.name,
      deadline: award.deadline || "",
      description: award.description || "",
    })
  }

  const handleEditChange = (field: AwardEditField, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }))
  }

  const saveEdit = () => {
    if (!editingId) return

    const payload: UpdateAwardParams = {
      name: editingId,
    }
    if (editFormData.deadline) payload.deadline = editFormData.deadline
    if (editFormData.description) payload.description = editFormData.description

    updateAward.mutate(payload, {
      onSuccess: () => setEditingId(null),
      onError: error => {
        alert(AWARD_MESSAGES.saveError(error.message))
      },
    })
  }

  const onDelete = (name: string) => {
    if (window.confirm(AWARD_MESSAGES.deleteConfirm(name))) {
      deleteAward.mutate(name)
    }
  }

  const toggleVisibility = (award: Award) => {
    setTogglingAward(award.name)
    updateAward.mutate(
      {
        name: award.name,
        hidden: !award.hidden,
      },
      {
        onSuccess: () => setTogglingAward(null),
        onError: error => {
          alert(AWARD_MESSAGES.toggleError(error.message))
          setTogglingAward(null)
        },
      },
    )
  }

  return {
    awards: awardsData?.items ?? [],
    isLoading,
    register,
    handleSubmit,
    onCreate,
    isCreating: createAward.isPending,
    errors,
    editingId,
    setEditingId,
    editFormData,
    startEdit,
    handleEditChange,
    saveEdit,
    isSaving: updateAward.isPending,
    onDelete,
    toggleVisibility,
    togglingAward,
  }
}

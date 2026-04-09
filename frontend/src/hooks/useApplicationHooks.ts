import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "../services/api"
import { getMonitoring } from "../services/monitoring"
import { ApplicationsResponse } from "../services/api/applications"

// Get current user's applications
export function useMyApplications() {
  return useQuery({
    queryKey: ["myApplications"],
    queryFn: (): Promise<ApplicationsResponse> =>
      api.applications.getMyApplications(),
  })
}

// Get all applications (admin only)
export function useApplications() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: (): Promise<ApplicationsResponse> =>
      api.applications.getAllApplications(),
  })
}

// Get single application by ID
export function useApplication(id: string | undefined) {
  return useQuery({
    queryKey: ["application", id],
    queryFn: () => api.applications.getApplication(id!),
    enabled: !!id,
  })
}

// Submit a new application
export function useSubmitApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      grantName,
      fieldValues,
      awardName,
      awardJustification,
    }: {
      grantName: string
      fieldValues: Record<string, string>
      awardName?: string
      awardJustification?: string
    }) => {
      const transaction = getMonitoring().startTransaction({
        name: "submit-application",
        op: "ui.submit",
        data: { grantName },
      })
      try {
        const result = await api.applications.submitApplication(
          grantName,
          fieldValues,
          awardName,
          awardJustification,
        )
        transaction.setStatus("ok")
        return result
      } catch (error) {
        transaction.setStatus("error")
        throw error
      } finally {
        transaction.finish()
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["myApplications"] })
      void queryClient.invalidateQueries({ queryKey: ["applications"] })
    },
  })
}

// Update application (admin can update status/feedback/fields; user can update fields if pending)
export function useUpdateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicationId,
      status,
      feedback,
      fieldValues,
    }: {
      applicationId: string
      status?: string
      feedback?: string
      fieldValues?: Record<string, string>
    }) => {
      const data: {
        status?: string
        feedback?: string
        field_values?: Record<string, string>
      } = {}
      if (status !== undefined) data.status = status
      if (feedback !== undefined) data.feedback = feedback
      if (fieldValues !== undefined) data.field_values = fieldValues
      return api.applications.updateApplication(applicationId, data)
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["application", variables.applicationId],
      })
      void queryClient.invalidateQueries({ queryKey: ["myApplications"] })
      void queryClient.invalidateQueries({ queryKey: ["applications"] })
    },
  })
}

// Delete application
export function useDeleteApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (applicationId: string) =>
      api.applications.deleteApplication(applicationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["myApplications"] })
      void queryClient.invalidateQueries({ queryKey: ["applications"] })
    },
  })
}

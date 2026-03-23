import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "../services/api"

// Get current user's applications
export function useMyApplications() {
  return useQuery({
    queryKey: ["myApplications"],
    queryFn: () => api.applications.getMyApplications(),
  })
}

// Get all applications (admin only)
export function useApplications() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: () => api.applications.getAllApplications(),
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
    mutationFn: ({
      grantName,
      fieldValues,
      awardName,
      awardJustification,
    }: {
      grantName: string
      fieldValues: Record<string, string>
      awardName?: string
      awardJustification?: string
    }) =>
      api.applications.submitApplication(
        grantName,
        fieldValues,
        awardName,
        awardJustification,
      ),
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

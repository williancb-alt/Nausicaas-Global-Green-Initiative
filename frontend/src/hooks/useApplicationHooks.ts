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
    }: {
      grantName: string
      fieldValues: Record<string, string>
    }) => api.applications.submitApplication(grantName, fieldValues),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["myApplications"] })
      void queryClient.invalidateQueries({ queryKey: ["applications"] })
    },
  })
}

// Update application status/feedback (admin only)
export function useUpdateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicationId,
      status,
      feedback,
    }: {
      applicationId: string
      status?: string
      feedback?: string
    }) => {
      const data: { status?: string; feedback?: string } = {}
      if (status !== undefined) data.status = status
      if (feedback !== undefined) data.feedback = feedback
      return api.applications.updateApplication(applicationId, data)
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["application", variables.applicationId],
      })
      void queryClient.invalidateQueries({ queryKey: ["applications"] })
    },
  })
}

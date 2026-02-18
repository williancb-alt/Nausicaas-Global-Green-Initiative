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
      queryClient.invalidateQueries({ queryKey: ["myApplications"] })
      queryClient.invalidateQueries({ queryKey: ["applications"] })
    },
  })
}

// Update an application
export function useUpdateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: { status?: string; feedback?: string; field_values?: Record<string, string> }
    }) => api.applications.updateApplication(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["myApplications"] })
      queryClient.invalidateQueries({ queryKey: ["applications"] })
      queryClient.invalidateQueries({ queryKey: ["application", String(variables.id)] })
    },
  })
}

// Delete an application
export function useDeleteApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => api.applications.deleteApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myApplications"] })
      queryClient.invalidateQueries({ queryKey: ["applications"] })
    },
  })
}

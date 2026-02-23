import { apiClient } from "./client"
import type { Application } from "../../types"

interface ApplicationsResponse {
  items: Application[]
  has_prev: boolean
  has_next: boolean
  page: number
  total_pages: number
  total_items: number
}

export const applications = {
  // Get current user's applications
  getMyApplications: async (
    page = 1,
    itemsPerPage = 10,
  ): Promise<ApplicationsResponse> => {
    const response = await apiClient.get<ApplicationsResponse>(
      `/api/v1/applications/me?page=${page}&per_page=${itemsPerPage}`,
    )
    return response.data
  },

  // Get all applications (admin only)
  getAllApplications: async (
    page = 1,
    itemsPerPage = 10,
  ): Promise<ApplicationsResponse> => {
    const response = await apiClient.get<ApplicationsResponse>(
      `/api/v1/applications?page=${page}&per_page=${itemsPerPage}`,
    )
    return response.data
  },

  // Get single application by ID
  getApplication: async (id: string): Promise<Application> => {
    const response = await apiClient.get<Application>(
      `/api/v1/applications/${id}`,
    )
    return response.data
  },

  // Submit a new application
  submitApplication: async (
    grantName: string,
    fieldValues: Record<string, string>,
  ): Promise<{ status: string; message: string; application_id: number }> => {
    const response = await apiClient.post<{
      status: string
      message: string
      application_id: number
    }>(
      "/api/v1/applications",
      { grant_name: grantName, field_values: fieldValues },
      { headers: { "Content-Type": "application/json" } },
    )
    return response.data
  },

  // Update application (admin can update status/feedback/fields; user can update fields if pending)
  updateApplication: async (
    applicationId: string,
    data: {
      status?: string
      feedback?: string
      field_values?: Record<string, string>
    },
  ): Promise<{ status: string; message: string }> => {
    const response = await apiClient.put<{ status: string; message: string }>(
      `/api/v1/applications/${applicationId}`,
      data,
      { headers: { "Content-Type": "application/json" } },
    )
    return response.data
  },

  // Delete an application
  deleteApplication: async (applicationId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/applications/${applicationId}`)
  },
}

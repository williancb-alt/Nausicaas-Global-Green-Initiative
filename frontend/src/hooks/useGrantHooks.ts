import { useMutation, useQuery } from "@tanstack/react-query"
import { api } from "../services/api"
import { useGrantsStore } from "../store/grantsStore"
import { CreateGrantParams, UpdateGrantParams } from "../types"

const mockGrants = [
  {
    name: "Climate Resilience Fund",
    deadline: "03/15/26",
    description: "Support climate adaptation and resilience projects",
    created_at_iso8601: "2026-01-01T00:00:00Z",
    created_at_rfc822: "Mon, 01 Jan 2026 00:00:00 +0000",
    deadline_passed: false,
    time_remaining: "42 days",
    info_url: null,
  },
  {
    name: "Mangrove Restoration Grant",
    deadline: "04/30/26",
    description: "Restore and protect mangrove ecosystems",
    created_at_iso8601: "2026-01-05T00:00:00Z",
    created_at_rfc822: "Sat, 05 Jan 2026 00:00:00 +0000",
    deadline_passed: false,
    time_remaining: "87 days",
    info_url: null,
  },
  {
    name: "Forest Conservation Initiative",
    deadline: "02/28/26",
    description: "Protect and expand forest coverage",
    created_at_iso8601: "2025-12-15T00:00:00Z",
    created_at_rfc822: "Mon, 15 Dec 2025 00:00:00 +0000",
    deadline_passed: false,
    time_remaining: "26 days",
    info_url: null,
  },
]

export function useGrants() {
  const { currentPage, itemsPerPage } = useGrantsStore()

  return useQuery({
    queryKey: ["grants", currentPage, itemsPerPage],
    queryFn: async () => {
      // Return mock data for now. Replace with API call when backend is ready.
      // const response = await api.grants.listGrants(currentPage, itemsPerPage);
      // return response;
      
      // Calculate pagination
      const startIdx = (currentPage - 1) * itemsPerPage
      const endIdx = startIdx + itemsPerPage
      const paginatedGrants = mockGrants.slice(startIdx, endIdx)
      
      return {
        items: paginatedGrants,
        has_next: endIdx < mockGrants.length,
        has_prev: currentPage > 1,
        page: currentPage,
        total_pages: Math.ceil(mockGrants.length / itemsPerPage),
        total_items: mockGrants.length,
      }
    },
  })
}

export function useCreateGrant() {
  return useMutation({
    mutationFn: (params: CreateGrantParams) => api.grants.createGrant(params),
  })
}

export function useUpdateGrant() {
  return useMutation({
    mutationFn: (params: UpdateGrantParams) =>
      api.grants.updateGrant(params.name, { deadline: params.deadline }),
  })
}

export function useDeleteGrant() {
  return useMutation({
    mutationFn: (name: string) => api.grants.deleteGrant(name),
  })
}

export function useGrant(name: string) {
  return useQuery({
    queryKey: ["grant", name],
    queryFn: () => api.grants.getGrant(name),
    enabled: !!name,
  })
}

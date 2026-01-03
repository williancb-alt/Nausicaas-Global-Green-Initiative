import { useMutation, useQuery } from "@tanstack/react-query"
import { api } from "../services/api"
import { useGrantsStore } from "../store/grantsStore"
import { CreateGrantParams, UpdateGrantParams } from "../types"

export function useGrants() {
  const { currentPage, itemsPerPage } = useGrantsStore()

  return useQuery({
    queryKey: ["grants", currentPage, itemsPerPage],
    queryFn: () => api.grants.listGrants(currentPage, itemsPerPage),
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

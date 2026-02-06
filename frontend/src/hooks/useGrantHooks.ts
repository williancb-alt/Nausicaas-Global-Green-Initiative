import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: CreateGrantParams) => api.grants.createGrant(params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grants"] }),
  })
}

export function useUpdateGrant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: UpdateGrantParams) =>
      api.grants.updateGrant(params.name, params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grants"] }),
  })
}

export function useDeleteGrant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => api.grants.deleteGrant(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grants"] }),
  })
}

export function useGrant(name: string) {
  return useQuery({
    queryKey: ["grant", name],
    queryFn: () => api.grants.getGrant(name),
    enabled: !!name,
  })
}

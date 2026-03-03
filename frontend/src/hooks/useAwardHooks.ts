import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "../services/api"
import { useAwardsStore } from "../store/awardsStore"
import { CreateAwardParams, UpdateAwardParams } from "../types"

export function useAwards() {
  const { currentPage, itemsPerPage } = useAwardsStore()

  return useQuery({
    queryKey: ["awards", currentPage, itemsPerPage],
    queryFn: () => api.awards.listAwards(currentPage, itemsPerPage),
  })
}

export function useCreateAward() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: CreateAwardParams) => api.awards.createAward(params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["awards"] }),
  })
}

export function useUpdateAward() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: UpdateAwardParams) =>
      api.awards.updateAward(params.name, params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["awards"] }),
  })
}

export function useDeleteAward() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => api.awards.deleteAward(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["awards"] }),
  })
}

export function useAward(name: string) {
  return useQuery({
    queryKey: ["award", name],
    queryFn: () => api.awards.getAward(name),
    enabled: !!name,
  })
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { api } from "../services/api"
import { useAuthStore } from "../store/authStore"
import { LoginCredentials } from "../types"

export function useLogin() {
  const { setUser } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password }: LoginCredentials) =>
      api.auth.login(email, password),
    onSuccess: async () => {
      try {
        const user = await api.auth.getUser()
        setUser(user)
        await queryClient.invalidateQueries({ queryKey: ["user"] })
      } catch (error) {
        // TODO - error handling - trigger state or dispatch to show message to user informing of error
        console.error("Failed to fetch user after login:", error)
      }
    },
  })
}

export function useLogout() {
  const { clearAuth } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.auth.logout(),
    onSuccess: () => {
      clearAuth()
      queryClient.clear()
    },
  })
}

export function useUser() {
  const { setUser, clearAuth } = useAuthStore()

  const query = useQuery({
    queryKey: ["user"],
    queryFn: () => api.auth.getUser(),
    retry: false,
  })

  useEffect(() => {
    if (query.data) {
      setUser(query.data)
    } else if (query.isError) {
      clearAuth()
    }
  }, [query.data, query.isError, setUser, clearAuth])

  return query
}

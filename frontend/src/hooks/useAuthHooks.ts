import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { api } from "../services/api"
import { getMonitoring } from "../services/monitoring"
import { useAuthStore } from "../store/authStore"
import { LoginCredentials } from "../types"
import { UserInfo } from "../services/api/types"

function setMonitoringUser(user: UserInfo | null): void {
  // Get the monitoring instance and set user context
  // for error tracking and performance monitoring
  const monitoring = getMonitoring()
  if (user) {
    monitoring.setUser({
      id: user.public_id ?? user.email,
      email: user.email,
    })
    monitoring.setTag("user.role", user.admin ? "admin" : "user")
  } else {
    monitoring.setUser(null)
  }
}

function useAuthMutation(
  mutationFn: ({ email, password }: LoginCredentials) => Promise<unknown>,
  errorContext: string,
) {
  const { setUser } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password }: LoginCredentials) =>
      mutationFn({ email, password }),
    onSuccess: async () => {
      try {
        const user = await api.auth.getUser()
        setUser(user)
        setMonitoringUser(user)
        await queryClient.invalidateQueries({ queryKey: ["user"] })
      } catch (error) {
        getMonitoring().captureException(error, { context: errorContext })
      }
    },
  })
}

export function useLogin() {
  return useAuthMutation(
    ({ email, password }) => api.auth.login(email, password),
    "post-login user fetch",
  )
}

export function useLogout() {
  const { clearAuth } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.auth.logout(),
    onSuccess: () => {
      clearAuth()
      setMonitoringUser(null)
      queryClient.clear()
    },
  })
}

export function useRegister() {
  return useAuthMutation(
    ({ email, password }) => api.auth.register(email, password),
    "post-register user fetch",
  )
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => api.auth.forgotPassword(email),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      api.auth.resetPassword(token, password),
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
      setMonitoringUser(query.data)
    } else if (query.isError) {
      clearAuth()
      setMonitoringUser(null)
    }
  }, [query.data, query.isError, setUser, clearAuth])

  return query
}

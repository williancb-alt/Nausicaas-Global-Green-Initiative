import { useMutation } from "@tanstack/react-query"
import { useAuthStore } from "../store/authStore"
import type { LoginFormData } from "../schemas/authSchema"

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser)
  const setToken = useAuthStore((state) => state.setToken)

  return useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Login failed")
      return response.json()
    },
    onSuccess: (data) => {
      setUser(data.user)
      setToken(data.token)
    },
  })
}
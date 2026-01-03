import {
  apiClient,
  type BaseResponse,
  type AuthSuccess,
  type UserInfo,
} from "./client"

export const authApi = {
  register: async (email: string, password: string): Promise<AuthSuccess> => {
    const { data } = await apiClient.post<AuthSuccess>(
      "/api/v1/auth/register",
      new URLSearchParams({ email, password }),
    )
    return data
  },

  login: async (email: string, password: string): Promise<AuthSuccess> => {
    const { data } = await apiClient.post<AuthSuccess>(
      "/api/v1/auth/login",
      new URLSearchParams({ email, password }),
    )
    return data
  },

  getUser: async (): Promise<UserInfo> => {
    const { data } = await apiClient.get<UserInfo>("/api/v1/auth/user")
    return data
  },

  logout: async (): Promise<BaseResponse> => {
    const { data } = await apiClient.post<BaseResponse>("/api/v1/auth/logout")
    return data
  },
}

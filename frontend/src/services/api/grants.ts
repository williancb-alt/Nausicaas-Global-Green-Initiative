import {
  apiClient,
  type BaseResponse,
  type Grant,
  type GrantPage,
} from "./client"

export const grantsApi = {
  createGrant: async (params: {
    name: string
    deadline: string
  }): Promise<BaseResponse> => {
    const { data } = await apiClient.post<BaseResponse>(
      "/api/v1/grants",
      new URLSearchParams({ name: params.name, deadline: params.deadline }),
    )
    return data
  },

  listGrants: async (page = 1, perPage = 10): Promise<GrantPage> => {
    const { data } = await apiClient.get<GrantPage>("/api/v1/grants", {
      params: { page, per_page: perPage },
    })
    return data
  },

  getGrant: async (name: string): Promise<Grant> => {
    const { data } = await apiClient.get<Grant>(
      `/api/v1/grants/${encodeURIComponent(name)}`,
    )
    return data
  },

  updateGrant: async (
    name: string,
    data: { deadline: string },
  ): Promise<BaseResponse | Grant> => {
    const { data: responseData } = await apiClient.put<BaseResponse | Grant>(
      `/api/v1/grants/${encodeURIComponent(name)}`,
      new URLSearchParams({ deadline: data.deadline }),
    )
    return responseData
  },

  deleteGrant: async (name: string): Promise<void> => {
    await apiClient.delete(`/api/v1/grants/${encodeURIComponent(name)}`)
  },
}

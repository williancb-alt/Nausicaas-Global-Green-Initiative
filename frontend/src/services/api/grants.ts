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
    description: string
    custom_fields?: string
  }): Promise<BaseResponse> => {
    const formData = new URLSearchParams({
      name: params.name,
      deadline: params.deadline,
      description: params.description,
    })
    if (params.custom_fields) {
      formData.append("custom_fields", params.custom_fields)
    }
    const { data } = await apiClient.post<BaseResponse>(
      "/api/v1/grants",
      formData,
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
    console.log("Fetched grant:", data)
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

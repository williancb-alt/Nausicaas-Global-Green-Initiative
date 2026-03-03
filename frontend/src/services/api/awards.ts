import {
  apiClient,
  type BaseResponse,
  type Award,
  type AwardPage,
} from "./client"

export const awardsApi = {
  createAward: async (params: {
    name: string
    deadline: string
    description: string
  }): Promise<BaseResponse> => {
    const formData = new URLSearchParams({
      name: params.name,
      deadline: params.deadline,
      description: params.description,
    })
    const { data } = await apiClient.post<BaseResponse>(
      "/api/v1/awards",
      formData,
    )
    return data
  },

  listAwards: async (page = 1, perPage = 10): Promise<AwardPage> => {
    const { data } = await apiClient.get<AwardPage>("/api/v1/awards", {
      params: { page, per_page: perPage },
    })
    return data
  },

  getAward: async (name: string): Promise<Award> => {
    const { data } = await apiClient.get<Award>(
      `/api/v1/awards/${encodeURIComponent(name)}`,
    )
    return data
  },

  updateAward: async (
    name: string,
    data: {
      deadline?: string
      description?: string
      hidden?: boolean
    },
  ): Promise<BaseResponse | Award> => {
    const params = new URLSearchParams()
    if (data.deadline !== undefined) params.append("deadline", data.deadline)
    if (data.description !== undefined)
      params.append("description", data.description)
    if (data.hidden !== undefined) params.append("hidden", String(data.hidden))

    const { data: responseData } = await apiClient.put<BaseResponse | Award>(
      `/api/v1/awards/${encodeURIComponent(name)}`,
      params,
    )
    return responseData
  },

  deleteAward: async (name: string): Promise<void> => {
    await apiClient.delete(`/api/v1/awards/${encodeURIComponent(name)}`)
  },
}

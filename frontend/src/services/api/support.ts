import { apiClient } from "./client"

export interface SupportMessage {
  id: number
  subject: string
  message: string
  status: string
  created_at_str: string
  user: {
    email: string
    public_id: string
  }
  application_id: number
  admin_response?: string
  answered_at?: string
  answered_at_str?: string
}

export const supportApi = {
  createMessage: async (data: {
    application_id: number | string
    subject: string
    message: string
  }): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      "/api/v1/support",
      data,
      {
        headers: { "Content-Type": "application/json" },
      },
    )
    return response.data
  },

  getAllMessages: async (): Promise<SupportMessage[]> => {
    const response = await apiClient.get<SupportMessage[]>("/api/v1/support")
    return response.data
  },

  replyToMessage: async (
    messageId: number,
    replyText: string,
  ): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      `/api/v1/support/${messageId}/reply`,
      {
        message: replyText,
      },
      {
        headers: { "Content-Type": "application/json" },
      },
    )
    return response.data
  },
}

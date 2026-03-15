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
}

export const supportApi = {
    createMessage: async (data: {
        application_id: number | string
        subject: string
        message: string
    }) => {
        const response = await apiClient.post("/support", data)
        return response.data
    },

    getAllMessages: async (): Promise<SupportMessage[]> => {
        const response = await apiClient.get("/support")
        return response.data
    },
}

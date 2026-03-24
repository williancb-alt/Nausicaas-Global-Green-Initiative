import { useEffect, useState } from "react"
import { api } from "../services/api"
import type { SupportMessage } from "../services/api/support"
import { AxiosError } from "axios"
import { FilterStatus, SupportStats } from "../components/support/types"

export function useSupportManagement() {
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Interaction State
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [viewingHistory, setViewingHistory] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isSending, setIsSending] = useState(false)

  const fetchMessages = async (): Promise<void> => {
    try {
      setLoading(true)
      const data: SupportMessage[] = await api.support.getAllMessages()
      setMessages(data)
      setError(null)
    } catch (err) {
      handleApiError(err, "Failed to load messages.")
    } finally {
      setLoading(false)
    }
  }

  const handleApiError = (err: unknown, defaultMsg: string) => {
    if (err instanceof AxiosError) {
      const apiError = err as AxiosError<{ message?: string }>
      setError(apiError.response?.data?.message || err.message || defaultMsg)
    } else if (err instanceof Error) {
      setError(err.message)
    } else {
      setError("An unknown error occurred.")
    }
  }

  useEffect(() => {
    void fetchMessages()
  }, [])

  const handleSendReply = async (messageId: number) => {
    if (!replyContent.trim()) return

    try {
      setIsSending(true)
      await api.support.replyToMessage(messageId, replyContent)

      // Reset state and refresh
      setReplyContent("")
      setReplyingTo(null)
      setViewingHistory(messageId)
      await fetchMessages()
    } catch (err) {
      handleApiError(err, "Failed to send reply.")
    } finally {
      setIsSending(false)
    }
  }

  // Derived State
  const stats: SupportStats = {
    total: messages.length,
    pending: messages.filter(m => m.status === "Open").length,
    replied: messages.filter(m => m.status === "Replied").length,
  }

  const filteredMessages = messages.filter(m => {
    const matchesFilter =
      statusFilter === "all" ||
      (statusFilter === "pending" && m.status === "Open") ||
      (statusFilter === "replied" && m.status === "Replied")

    const matchesSearch =
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return {
    filteredMessages,
    loading,
    error,
    setError,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    replyingTo,
    setReplyingTo,
    viewingHistory,
    setViewingHistory,
    replyContent,
    setReplyContent,
    isSending,
    handleSendReply,
    stats,
  }
}

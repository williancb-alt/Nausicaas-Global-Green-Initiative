import { useEffect, useState } from "react"
import { api } from "../services/api"
import type { SupportMessage } from "../services/api/support"
import { FilterStatus } from "../components/support/types"
import {
  getErrorMessage,
  calculateSupportStats,
  checkMessageMatch,
} from "./useSupportManagement.helpers"

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
      const data = await api.support.getAllMessages()
      setMessages(data)
      setError(null)
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load messages."))
    } finally {
      setLoading(false)
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
      setError(getErrorMessage(err, "Failed to send reply."))
    } finally {
      setIsSending(false)
    }
  }

  const stats = calculateSupportStats(messages)

  const filteredMessages = messages.filter(m =>
    checkMessageMatch(m, statusFilter, searchQuery),
  )

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

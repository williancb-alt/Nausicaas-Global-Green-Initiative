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

/**
 * Pure helper function to get error message from API errors.
 */
function getErrorMessage(err: unknown, defaultMsg: string): string {
  if (err instanceof AxiosError) {
    const apiError = err as AxiosError<{ message?: string }>
    return apiError.response?.data?.message || err.message || defaultMsg
  }
  if (err instanceof Error) {
    return err.message
  }
  return "An unknown error occurred."
}

/**
 * Pure helper function to calculate support statistics in one pass.
 */
function calculateSupportStats(messages: SupportMessage[]): SupportStats {
  return messages.reduce<SupportStats>(
    (acc, m) => {
      const status = (m.status || "").trim().toLowerCase()
      if (status === "open") acc.pending++
      if (status === "replied") acc.replied++
      return acc
    },
    { total: messages.length, pending: 0, replied: 0 },
  )
}

/**
 * Pure helper function to check if a message matches filters.
 */
function checkMessageMatch(
  m: SupportMessage,
  statusFilter: FilterStatus,
  searchQuery: string,
): boolean {
  const status = (m.status || "").trim().toLowerCase()
  const subject = (m.subject || "").toLowerCase()
  const email = (m.user?.email || "").toLowerCase()
  const query = searchQuery.trim().toLowerCase()

  const matchesFilter =
    statusFilter === "all" ||
    (statusFilter === "pending" && status === "open") ||
    (statusFilter === "replied" && status === "replied")

  if (!matchesFilter) return false

  if (!query) return true

  return subject.includes(query) || email.includes(query)
}

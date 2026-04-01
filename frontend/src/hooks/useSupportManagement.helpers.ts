import { SupportMessage } from "../services/api/support"
import { FilterStatus, SupportStats } from "../components/support/types"

/**
 * Pure helper function to get error message from API errors.
 */
export function getErrorMessage(err: unknown, defaultMsg: string): string {
  if (err instanceof Error) {
    return err.message
  }
  return defaultMsg
}

/**
 * Pure helper function to calculate support statistics in one pass.
 */
export function calculateSupportStats(
  messages: SupportMessage[],
): SupportStats {
  const result: SupportStats = {
    total: messages.length,
    pending: 0,
    replied: 0,
  }

  messages.forEach(m => {
    const status = (m.status || "").trim().toLowerCase()
    if (status === "open") {
      result.pending++
    } else if (status === "replied") {
      result.replied++
    }
  })

  return result
}

/**
 * Split filtering logic into smaller pieces to satisfy cyclomatic complexity limits.
 */
export function checkMessageMatch(
  m: SupportMessage,
  statusFilter: FilterStatus,
  searchQuery: string,
): boolean {
  if (statusFilter !== "all" && !isCorrectStatus(m, statusFilter)) {
    return false
  }
  return isSearchMatch(m, searchQuery)
}

function isCorrectStatus(m: SupportMessage, filter: FilterStatus): boolean {
  const status = (m.status || "").trim().toLowerCase()
  if (filter === "pending") {
    return status === "open"
  }
  if (filter === "replied") {
    return status === "replied"
  }
  return false
}

function isSearchMatch(m: SupportMessage, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const subject = (m.subject || "").toLowerCase()
  const email = (m.user?.email || "").toLowerCase()

  return subject.includes(q) || email.includes(q)
}

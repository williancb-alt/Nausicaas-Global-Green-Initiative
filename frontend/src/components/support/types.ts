export type FilterStatus = "all" | "pending" | "replied"

export interface SupportStats {
  total: number
  pending: number
  replied: number
}

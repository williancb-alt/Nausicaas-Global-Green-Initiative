export type SeverityLevel = "fatal" | "error" | "warning" | "info" | "debug"

export type MonitoringUser = {
  id: string
  email?: string
  username?: string
}

export type Breadcrumb = {
  category: string
  message: string
  level?: SeverityLevel
  data?: Record<string, unknown>
}

export type SpanAttributeValue = string | number | boolean

export type TransactionContext = {
  name: string
  op: string
  data?: Record<string, SpanAttributeValue>
}

export interface MonitoringService {
  captureException(error: unknown, context?: Record<string, unknown>): void
  captureMessage(message: string, level?: SeverityLevel): void
  setUser(user: MonitoringUser | null): void
  addBreadcrumb(breadcrumb: Breadcrumb): void
  startTransaction(context: TransactionContext): MonitoringTransaction
  setTag(key: string, value: string): void
  setContext(name: string, context: Record<string, unknown>): void
}

export interface MonitoringTransaction {
  finish(): void
  setStatus(status: string): void
}

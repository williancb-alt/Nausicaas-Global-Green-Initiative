import * as Sentry from "@sentry/react"

import type { MonitoringTransaction, TransactionContext } from "../types"

// Wrapper around Sentry's transaction to align with MonitoringTransaction interface
export class SentryTransaction implements MonitoringTransaction {
  // Reference to the underlying Sentry transaction
  private span: Sentry.Span | undefined

  constructor(context: TransactionContext) {
    // Updates: Sentry's startInactiveSpan is used to
    // create a transaction that can be started and finished
    // manually
    this.span = Sentry.startInactiveSpan({
      name: context.name,
      op: context.op,
      forceTransaction: true,
      ...(context.data && { attributes: context.data }),
    })
  }

  // Method to finish the transaction
  finish(): void {
    this.span?.end()
  }

  // Method to set the status of the transaction
  setStatus(status: string): void {
    this.span?.setStatus({ code: status === "ok" ? 1 : 2, message: status })
  }
}

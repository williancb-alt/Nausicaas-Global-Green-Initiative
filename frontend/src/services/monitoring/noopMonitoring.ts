import type { MonitoringService, MonitoringTransaction } from "./types"

const noopTransaction: MonitoringTransaction = {
  finish() {},
  setStatus() {},
}

export class NoopMonitoringService implements MonitoringService {
  captureException(): void {}
  captureMessage(): void {}
  setUser(): void {}
  addBreadcrumb(): void {}
  startTransaction(): MonitoringTransaction {
    return noopTransaction
  }
  setTag(): void {}
  setContext(): void {}
}

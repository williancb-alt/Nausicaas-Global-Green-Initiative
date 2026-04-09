import { config } from "../../config"
import { NoopMonitoringService } from "./noopMonitoring"
import { createSentryMonitoringService } from "./sentry/sentryMonitoring"
import type { MonitoringService } from "./types"

// Default to NoopMonitoringService until initMonitoring is called with a valid DSN
let monitoringInstance: MonitoringService = new NoopMonitoringService()

export function initMonitoring(): void {
  // Only initialise Sentry if a DSN is provided
  if (!config.sentryDsn) return

  // Update the monitoring instance to Sentry
  // with config based on env
  monitoringInstance = createSentryMonitoringService({
    dsn: config.sentryDsn,
    environment: config.env,
    ...(config.appVersion && { release: config.appVersion }),
    tracesSampleRate: config.isProd ? 0.2 : 1.0,
    profileSessionSampleRate: config.isProd ? 0.1 : 1.0,
    replaysSessionSampleRate: config.isProd ? 0.1 : 0,
    replaysOnErrorSampleRate: 1.0,
    debug: config.isDev,
  })
}

// Helper to get the current monitoring instance
export function getMonitoring(): MonitoringService {
  return monitoringInstance
}
